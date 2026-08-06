from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import mongo
from app.models.content import ContentBlock
from app.models.team import SystemSettings

router = APIRouter(prefix="/api/v1/content", tags=["content"])


@router.get("/settings", response_model=SystemSettings)
async def get_settings():
    settings_doc = await mongo.get_system_settings()
    return SystemSettings(
        registration_open=settings_doc.get("registration_open", True),
        level1_open=settings_doc.get("level1_open", True),
        level2_open=settings_doc.get("level2_open", True),
    )


@router.patch("/settings", response_model=SystemSettings)
async def update_settings(updates: SystemSettings, _coord: dict = Depends(require_role("coordinator"))):
    doc = await mongo.update_system_settings(updates.model_dump())
    return SystemSettings(
        registration_open=doc.get("registration_open", True),
        level1_open=doc.get("level1_open", True),
        level2_open=doc.get("level2_open", True),
    )


@router.get("/{slug}", response_model=ContentBlock)
async def get_content(slug: str):
    block = await mongo.content.find_one({"_id": slug})
    if not block:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No content at this slug")
    return block


@router.put("/{slug}", response_model=ContentBlock)
async def put_content(slug: str, body: ContentBlock, _admin: dict = Depends(require_role("admin"))):
    payload = body.model_dump()
    payload["_id"] = slug
    await mongo.content.replace_one({"_id": slug}, payload, upsert=True)
    return payload
