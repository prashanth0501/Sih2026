from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, require_role
from app.db import mongo
from app.models.team import LockUpdate, SubmissionCreate, TeamCreate, TeamMember, TeamPublic
from app.services import screening

MAX_MEMBERS = 5  # + the leader = 6 total, per the official SIH team-size rule

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])


async def _get_owned_or_404(team_id: str) -> dict:
    team = await mongo.teams.find_one({"_id": team_id})
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    return team


def _require_unlocked(team: dict) -> None:
    if team.get("is_locked"):
        raise HTTPException(status.HTTP_423_LOCKED, "This team has been finalised by the SPOC/coordinators and can no longer be edited")


@router.post("", response_model=TeamPublic, status_code=status.HTTP_201_CREATED)
async def create_team(body: TeamCreate, user: dict = Depends(get_current_user)):
    existing = await mongo.teams.find_one({"leader_id": user["id"]})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "You already lead a team")

    tid = mongo.new_id("team")
    now = mongo.now_iso()
    team = {
        "_id": tid,
        "id": tid,
        "name": body.name,
        "leader_id": user["id"],
        "problem_statement_id": None,
        "theme": body.theme,
        "members": [],
        "status": "registered",
        "is_locked": False,
        "level1": {"status": "pending", "score": None, "feedback": None, "submission_url": None, "reviewer_id": None, "reviewed_at": None},
        "level2": {"status": "pending", "score": None, "feedback": None, "submission_url": None, "reviewer_id": None, "reviewed_at": None},
        "created_at": now,
        "updated_at": now,
    }
    await mongo.teams.insert_one(team)
    return team


@router.get("/mine", response_model=TeamPublic)
async def my_team(user: dict = Depends(get_current_user)):
    team = await mongo.teams.find_one({"leader_id": user["id"]})
    if team:
        return {**team, "viewer_is_leader": True}

    email = user["email"].lower()
    team = await mongo.teams.find_one({"members.email": {"$regex": f"^{email}$", "$options": "i"}})
    if team:
        return {**team, "viewer_is_leader": False}

    raise HTTPException(status.HTTP_404_NOT_FOUND, "You're not on a team yet")


@router.get("", response_model=list[TeamPublic])
async def list_teams(
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = None,
    page: int = 1,
    page_size: int = 25,
    user: dict = Depends(require_role("coordinator")),
):
    query = {}
    if status_filter:
        query["status"] = status_filter
    if q:
        query["name"] = {"$regex": q, "$options": "i"}

    start = (page - 1) * page_size
    cursor = mongo.teams.find(query).skip(start).limit(page_size)
    return await cursor.to_list(length=None)


@router.get("/{team_id}", response_model=TeamPublic)
async def get_team(team_id: str, user: dict = Depends(get_current_user)):
    team = await _get_owned_or_404(team_id)
    is_leader = team["leader_id"] == user["id"]
    return {**team, "viewer_is_leader": is_leader}


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
    if any(m["email"].lower() == body.email.lower() for m in team["members"]):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email is already on this team")

    member_dict = body.model_dump()
    now = mongo.now_iso()
    await mongo.teams.update_one({"_id": team_id}, {"$push": {"members": member_dict}, "$set": {"updated_at": now}})
    team["members"].append(member_dict)
    team["updated_at"] = now

    await mongo.ensure_member_login(body.name, body.email, body.department, body.year)
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
    updated_team = await screening.submit_level(team, body.level, body.submission_url, user["id"])
    return updated_team
