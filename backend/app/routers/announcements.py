from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.db import memory
from app.models.content import AnnouncementCreate, AnnouncementPublic

router = APIRouter(prefix="/api/v1/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementPublic])
def list_announcements():
    return sorted(memory.announcements.values(), key=lambda a: a["published_at"], reverse=True)


@router.post("", response_model=AnnouncementPublic, status_code=201)
def create_announcement(body: AnnouncementCreate, user: dict = Depends(require_role("coordinator"))):
    aid = memory.new_id("ann")
    record = {**body.model_dump(), "id": aid, "author_id": user["id"], "published_at": memory.now_iso(), "is_published": True}
    memory.announcements[aid] = record
    return record
