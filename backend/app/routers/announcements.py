from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.db import mongo
from app.models.content import AnnouncementCreate, AnnouncementPublic

router = APIRouter(prefix="/api/v1/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementPublic])
async def list_announcements():
    cursor = mongo.announcements.find({}).sort("published_at", -1)
    return await cursor.to_list(length=None)


@router.post("", response_model=AnnouncementPublic, status_code=201)
async def create_announcement(body: AnnouncementCreate, user: dict = Depends(require_role("coordinator"))):
    aid = mongo.new_id("ann")
    record = {
        "_id": aid,
        "id": aid,
        **body.model_dump(),
        "author_id": user["id"],
        "published_at": mongo.now_iso(),
        "is_published": True,
    }
    await mongo.announcements.insert_one(record)
    return record
