from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.db import mongo
from app.models.content import AdminStats, PublicStats

router = APIRouter(prefix="/api/v1/stats", tags=["stats"])


@router.get("/public", response_model=PublicStats)
async def public_stats():
    cursor = mongo.teams.find({})
    teams = await cursor.to_list(length=None)
    ideas = sum(1 for t in teams if t.get("level1", {}).get("submission_url"))
    ps_count = await mongo.problem_statements.count_documents({})
    return PublicStats(
        teams_registered=len(teams),
        ideas_submitted=ideas,
        problem_statements=ps_count,
        days_to_deadline=12,
    )


@router.get("/admin", response_model=AdminStats)
async def admin_stats(_coordinator: dict = Depends(require_role("coordinator"))):
    cursor = mongo.teams.find({})
    teams = await cursor.to_list(length=None)
    stages = {"registered": 0, "level1": 0, "level2": 0, "selected": 0}
    for t in teams:
        st = t.get("status", "registered")
        if st == "registered":
            stages["registered"] += 1
        elif st in ("l1_submitted", "l1_under_review", "l1_cleared", "l1_rejected"):
            stages["level1"] += 1
        elif st in ("l2_submitted", "l2_under_review", "l2_rejected"):
            stages["level2"] += 1
        elif st == "selected":
            stages["selected"] += 1

    return AdminStats(
        total_teams=len(teams),
        total_students=sum(len(t.get("members", [])) + 1 for t in teams),
        by_stage=stages,
        selected=stages["selected"],
    )
