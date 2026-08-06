from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.db import memory
from app.models.content import AdminStats, PublicStats

router = APIRouter(prefix="/api/v1/stats", tags=["stats"])


@router.get("/public", response_model=PublicStats)
def public_stats():
    teams = list(memory.teams.values())
    ideas = sum(1 for t in teams if t["level1"]["submission_url"])
    return PublicStats(
        teams_registered=len(teams),
        ideas_submitted=ideas,
        problem_statements=len(memory.problem_statements),
        days_to_deadline=12,
    )


@router.get("/admin", response_model=AdminStats)
def admin_stats(_coordinator: dict = Depends(require_role("coordinator"))):
    teams = list(memory.teams.values())
    stages = {"registered": 0, "level1": 0, "level2": 0, "selected": 0}
    for t in teams:
        if t["status"] == "registered":
            stages["registered"] += 1
        elif t["status"] in ("l1_submitted", "l1_under_review", "l1_cleared", "l1_rejected"):
            stages["level1"] += 1
        elif t["status"] in ("l2_submitted", "l2_under_review", "l2_rejected"):
            stages["level2"] += 1
        elif t["status"] == "selected":
            stages["selected"] += 1
    return AdminStats(
        total_teams=len(teams),
        total_students=sum(len(t["members"]) + 1 for t in teams),
        by_stage=stages,
        selected=stages["selected"],
    )
