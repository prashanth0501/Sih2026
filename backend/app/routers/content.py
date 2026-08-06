from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import mongo
from app.models.content import ContentBlock

router = APIRouter(prefix="/api/v1/content", tags=["content"])


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
