from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import memory
from app.models.team import ReviewDecision, TeamPublic
from app.services import screening

router = APIRouter(prefix="/api/v1/teams", tags=["screening"])


@router.post("/{team_id}/screening/{level}/review", response_model=TeamPublic)
def review(team_id: str, level: int, body: ReviewDecision, user: dict = Depends(require_role("coordinator"))):
    team = memory.teams.get(team_id)
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    if level not in (1, 2):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "level must be 1 or 2")

    submitted_status = "l1_submitted" if level == 1 else "l2_submitted"
    if team["status"] == submitted_status:
        screening.open_for_review(team, level, user["id"])

    screening.record_decision(team, level, body.score, body.feedback, body.pass_, user["id"])
    return team
