from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.db import memory
from app.models.team import TeamPublic

router = APIRouter(prefix="/api/v1/results", tags=["results"])


@router.get("", response_model=list[TeamPublic])
def get_results():
    return [t for t in memory.teams.values() if t["status"] == "selected"]


@router.post("/publish", status_code=200)
def publish_results(_spoc: dict = Depends(require_role("spoc"))):
    # In a real build this would flip a "results_published" flag read by
    # the public /results page; selection itself already happened via the
    # screening console. Left as a no-op switch here.
    return {"published": True}
