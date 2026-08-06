from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import memory
from app.models.content import ContentBlock

router = APIRouter(prefix="/api/v1/content", tags=["content"])


@router.get("/{slug}", response_model=ContentBlock)
def get_content(slug: str):
    block = memory.content.get(slug)
    if not block:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No content at this slug")
    return block


@router.put("/{slug}", response_model=ContentBlock)
def put_content(slug: str, body: ContentBlock, _admin: dict = Depends(require_role("admin"))):
    memory.content[slug] = body.model_dump()
    return memory.content[slug]
