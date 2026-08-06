import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.deps import get_current_user, require_role
from app.db import mongo
from app.models.team import LockUpdate, SubmissionCreate, TeamCreate, TeamMember, TeamPublic
from app.services import screening

MAX_MEMBERS = 5  # + the leader = 6 total, per the official SIH team-size rule

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])


class TeamAdminUpdate(BaseModel):
    name: str | None = None
    theme: str | None = None
    problem_statement_id: str | None = None
    status: str | None = None
    members: list[TeamMember] | None = None


async def _get_owned_or_404(team_id: str) -> dict:
    team = await mongo.teams.find_one({"_id": team_id})
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    return team


def _require_unlocked(team: dict) -> None:
    if team.get("is_locked"):
        raise HTTPException(status.HTTP_423_LOCKED, "This team has been finalised by the SPOC/coordinators and can no longer be edited")


async def _check_usn_available(usn: str, current_team_id: str | None = None) -> None:
    if not usn or not usn.strip():
        return
    clean_usn = usn.strip()
    regex_usn = {"$regex": f"^{re.escape(clean_usn)}$", "$options": "i"}

    # Search for teams containing this USN in leader or members
    existing_team = await mongo.teams.find_one({
        "_id": {"$ne": current_team_id} if current_team_id else {"$exists": True},
        "$or": [
            {"members.usn": regex_usn},
            {"leader_usn": regex_usn},
        ],
    })

    if existing_team:
        # If it's a solo team with no members and no PPT submission, auto-disband it for re-assignment
        if len(existing_team.get("members", [])) == 0 and not existing_team.get("level1", {}).get("submission_url"):
            await mongo.teams.delete_one({"_id": existing_team["id"]})
        else:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Student with USN '{clean_usn}' is already registered in team '{existing_team['name']}'. Each participant can belong to only 1 team.",
            )


@router.post("", response_model=TeamPublic, status_code=status.HTTP_201_CREATED)
async def create_team(body: TeamCreate, user: dict = Depends(get_current_user)):
    sys_settings = await mongo.get_system_settings()
    if not sys_settings.get("registration_open", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Registrations are currently closed by the admin.")

    existing = await mongo.teams.find_one({"leader_id": user["id"]})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "You already lead a team")

    leader_usn = body.leader_usn or user.get("usn", "")
    if leader_usn:
        await _check_usn_available(leader_usn)
        # Update leader user record with USN
        await mongo.users.update_one({"_id": user["id"]}, {"$set": {"usn": leader_usn}})

    # Check member USNs uniqueness
    for m in body.members:
        if m.usn:
            await _check_usn_available(m.usn)

    tid = mongo.new_id("team")
    now = mongo.now_iso()
    members_list = [m.model_dump() for m in body.members]

    team = {
        "_id": tid,
        "id": tid,
        "name": body.name,
        "leader_id": user["id"],
        "leader_usn": leader_usn,
        "problem_statement_id": None,
        "theme": body.theme,
        "members": members_list,
        "status": "registered",
        "is_locked": False,
        "level1": {"status": "pending", "score": None, "feedback": None, "submission_url": None, "reviewer_id": None, "reviewed_at": None},
        "level2": {"status": "pending", "score": None, "feedback": None, "submission_url": None, "reviewer_id": None, "reviewed_at": None},
        "created_at": now,
        "updated_at": now,
    }
    await mongo.teams.insert_one(team)

    # Ensure login accounts for members with USN
    for m in body.members:
        await mongo.ensure_member_login(m.name, m.email, m.department, m.year, m.usn, m.github_url)

    return team


@router.get("/mine", response_model=TeamPublic)
async def my_team(user: dict = Depends(get_current_user)):
    team = await mongo.teams.find_one({"leader_id": user["id"]})
    if team:
        return {**team, "viewer_is_leader": True}

    email = user["email"].lower()
    team = await mongo.teams.find_one({"members.email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
    if team:
        return {**team, "viewer_is_leader": False}

    usn = user.get("usn", "").strip()
    if usn:
        team = await mongo.teams.find_one({"members.usn": {"$regex": f"^{re.escape(usn)}$", "$options": "i"}})
        if team:
            return {**team, "viewer_is_leader": False}

    raise HTTPException(status.HTTP_404_NOT_FOUND, "You're not on a team yet")


@router.get("", response_model=list[TeamPublic])
async def list_teams(
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = None,
    page: int = 1,
    page_size: int = 500,
    user: dict = Depends(require_role("coordinator")),
):
    query = {}
    if status_filter and status_filter != "all":
        query["status"] = status_filter
    if q:
        query["name"] = {"$regex": re.escape(q), "$options": "i"}

    start = (page - 1) * page_size
    cursor = mongo.teams.find(query).sort("created_at", -1).skip(start).limit(page_size)
    return await cursor.to_list(length=None)


@router.get("/{team_id}", response_model=TeamPublic)
async def get_team(team_id: str, user: dict = Depends(get_current_user)):
    team = await _get_owned_or_404(team_id)
    is_leader = team["leader_id"] == user["id"]
    return {**team, "viewer_is_leader": is_leader}


@router.patch("/{team_id}", response_model=TeamPublic)
async def admin_update_team(
    team_id: str,
    body: TeamAdminUpdate,
    _coordinator: dict = Depends(require_role("coordinator")),
):
    team = await _get_owned_or_404(team_id)
    now = mongo.now_iso()
    updates = {"updated_at": now}

    if body.name is not None:
        updates["name"] = body.name
    if body.theme is not None:
        updates["theme"] = body.theme
    if body.problem_statement_id is not None:
        updates["problem_statement_id"] = body.problem_statement_id
    if body.status is not None:
        updates["status"] = body.status
    if body.members is not None:
        updates["members"] = [m.model_dump() for m in body.members]
        for m in body.members:
            await mongo.ensure_member_login(m.name, m.email, m.department, m.year, m.usn, m.github_url)

    await mongo.teams.update_one({"_id": team_id}, {"$set": updates})
    updated = await mongo.teams.find_one({"_id": team_id})
    return updated


@router.patch("/{team_id}/lock", response_model=TeamPublic)
async def set_lock(team_id: str, body: LockUpdate, user: dict = Depends(require_role("coordinator"))):
    team = await _get_owned_or_404(team_id)
    now = mongo.now_iso()
    await mongo.teams.update_one({"_id": team_id}, {"$set": {"is_locked": body.locked, "updated_at": now}})
    team["is_locked"] = body.locked
    team["updated_at"] = now
    return team


@router.post("/{team_id}/members", response_model=TeamPublic, status_code=status.HTTP_201_CREATED)
async def add_member(team_id: str, body: TeamMember, user: dict = Depends(get_current_user)):
    team = await _get_owned_or_404(team_id)
    if team["leader_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the team leader can add members")
    _require_unlocked(team)
    if len(team["members"]) >= MAX_MEMBERS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"A team can have at most {MAX_MEMBERS} members plus the leader")

    # Check unique USN & Email
    if body.usn:
        await _check_usn_available(body.usn, current_team_id=team_id)

    if any(m["email"].lower() == body.email.lower() for m in team["members"]):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email is already on this team")

    member_dict = body.model_dump()
    now = mongo.now_iso()
    await mongo.teams.update_one({"_id": team_id}, {"$push": {"members": member_dict}, "$set": {"updated_at": now}})
    team["members"].append(member_dict)
    team["updated_at"] = now

    await mongo.ensure_member_login(body.name, body.email, body.department, body.year, body.usn, body.github_url)
    return team


@router.delete("/{team_id}/members/{email}", response_model=TeamPublic)
async def remove_member(team_id: str, email: str, user: dict = Depends(get_current_user)):
    team = await _get_owned_or_404(team_id)
    if team["leader_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the team leader can remove members")
    _require_unlocked(team)

    new_members = [m for m in team["members"] if m["email"].lower() != email.lower()]
    now = mongo.now_iso()
    await mongo.teams.update_one({"_id": team_id}, {"$set": {"members": new_members, "updated_at": now}})
    team["members"] = new_members
    team["updated_at"] = now
    return team


@router.post("/{team_id}/submissions", response_model=TeamPublic)
async def submit(team_id: str, body: SubmissionCreate, user: dict = Depends(get_current_user)):
    team = await _get_owned_or_404(team_id)
    if team["leader_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the team leader can submit")
    _require_unlocked(team)

    sys_settings = await mongo.get_system_settings()
    if body.level == 1 and not sys_settings.get("level1_open", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Level 1 submissions are currently closed by the admin.")
    if body.level == 2 and not sys_settings.get("level2_open", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Level 2 submissions are currently closed by the admin.")

    updated_team = await screening.submit_level(team, body.level, body.submission_url, user["id"])
    return updated_team
