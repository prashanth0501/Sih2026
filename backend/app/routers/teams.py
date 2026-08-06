from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, require_role
from app.db import memory
from app.models.team import LockUpdate, SubmissionCreate, TeamCreate, TeamMember, TeamPublic
from app.services import screening

MAX_MEMBERS = 5  # + the leader = 6 total, per the official SIH team-size rule

router = APIRouter(prefix="/api/v1/teams", tags=["teams"])


def _get_owned_or_404(team_id: str) -> dict:
    team = memory.teams.get(team_id)
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    return team


def _require_unlocked(team: dict) -> None:
    if team.get("is_locked"):
        raise HTTPException(status.HTTP_423_LOCKED, "This team has been finalised by the SPOC/coordinators and can no longer be edited")


@router.post("", response_model=TeamPublic, status_code=status.HTTP_201_CREATED)
def create_team(body: TeamCreate, user: dict = Depends(get_current_user)):
    existing = next((t for t in memory.teams.values() if t["leader_id"] == user["id"]), None)
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "You already lead a team")

    tid = memory.new_id("team")
    team = {
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
        "created_at": memory.now_iso(),
        "updated_at": memory.now_iso(),
    }
    memory.teams[tid] = team
    return team


@router.get("/mine", response_model=TeamPublic)
def my_team(user: dict = Depends(get_current_user)):
    team = next((t for t in memory.teams.values() if t["leader_id"] == user["id"]), None)
    if team:
        return {**team, "viewer_is_leader": True}

    email = user["email"].lower()
    team = next((t for t in memory.teams.values() if any(m["email"].lower() == email for m in t["members"])), None)
    if team:
        return {**team, "viewer_is_leader": False}

    raise HTTPException(status.HTTP_404_NOT_FOUND, "You're not on a team yet")


@router.get("", response_model=list[TeamPublic])
def list_teams(
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = None,
    page: int = 1,
    page_size: int = 25,
    user: dict = Depends(require_role("coordinator")),
):
    rows = list(memory.teams.values())
    if status_filter:
        rows = [t for t in rows if t["status"] == status_filter]
    if q:
        needle = q.lower()
        rows = [t for t in rows if needle in t["name"].lower()]
    start = (page - 1) * page_size
    return rows[start : start + page_size]


@router.get("/{team_id}", response_model=TeamPublic)
def get_team(team_id: str, user: dict = Depends(get_current_user)):
    team = _get_owned_or_404(team_id)
    is_leader = team["leader_id"] == user["id"]
    return {**team, "viewer_is_leader": is_leader}


@router.patch("/{team_id}/lock", response_model=TeamPublic)
def set_lock(team_id: str, body: LockUpdate, user: dict = Depends(require_role("coordinator"))):
    """
    Finalising a team is an admin/coordinator action, not something the team
    leader can do to themselves. A locked team keeps its normal screening
    status — locking is independent of and layered on top of the state
    machine — it just freezes membership and submissions.
    """
    team = _get_owned_or_404(team_id)
    team["is_locked"] = body.locked
    team["updated_at"] = memory.now_iso()
    return team


@router.post("/{team_id}/members", response_model=TeamPublic, status_code=status.HTTP_201_CREATED)
def add_member(team_id: str, body: TeamMember, user: dict = Depends(get_current_user)):
    team = _get_owned_or_404(team_id)
    if team["leader_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the team leader can add members")
    _require_unlocked(team)
    if len(team["members"]) >= MAX_MEMBERS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"A team can have at most {MAX_MEMBERS} members plus the leader")
    if any(m["email"] == body.email for m in team["members"]):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email is already on this team")
    team["members"].append(body.model_dump())
    team["updated_at"] = memory.now_iso()
    memory.ensure_member_login(body.name, body.email, body.department, body.year)
    return team


@router.delete("/{team_id}/members/{email}", response_model=TeamPublic)
def remove_member(team_id: str, email: str, user: dict = Depends(get_current_user)):
    team = _get_owned_or_404(team_id)
    if team["leader_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the team leader can remove members")
    _require_unlocked(team)
    team["members"] = [m for m in team["members"] if m["email"] != email]
    team["updated_at"] = memory.now_iso()
    return team


@router.post("/{team_id}/submissions", response_model=TeamPublic)
def submit(team_id: str, body: SubmissionCreate, user: dict = Depends(get_current_user)):
    team = _get_owned_or_404(team_id)
    if team["leader_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the team leader can submit")
    _require_unlocked(team)
    screening.submit_level(team, body.level, body.submission_url, user["id"])
    return team
