from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.db import mongo
from app.models.team import TeamPublic

router = APIRouter(prefix="/api/v1/results", tags=["results"])


@router.get("", response_model=list[TeamPublic])
async def get_results():
    cursor = mongo.teams.find({"status": "selected"})
    return await cursor.to_list(length=None)


@router.post("/publish", status_code=200)
async def publish_results(_spoc: dict = Depends(require_role("spoc"))):
    return {"published": True}
