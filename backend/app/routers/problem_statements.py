from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import mongo
from app.models.content import ProblemStatement

router = APIRouter(prefix="/api/v1/problem-statements", tags=["problem-statements"])


@router.get("", response_model=list[ProblemStatement])
async def list_problem_statements(q: str | None = None, theme: str | None = None):
    query = {}
    if theme:
        query["theme"] = theme
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    cursor = mongo.problem_statements.find(query)
    return await cursor.to_list(length=None)


@router.put("/{ps_id}", response_model=ProblemStatement)
async def update_problem_statement(ps_id: str, body: ProblemStatement, _admin: dict = Depends(require_role("admin"))):
    existing = await mongo.problem_statements.find_one({"_id": ps_id})
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Problem statement not found")
    payload = body.model_dump()
    payload["_id"] = ps_id
    payload["id"] = ps_id
    await mongo.problem_statements.replace_one({"_id": ps_id}, payload)
    return payload
