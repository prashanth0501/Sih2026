from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import memory
from app.models.content import ProblemStatement

router = APIRouter(prefix="/api/v1/problem-statements", tags=["problem-statements"])


@router.get("", response_model=list[ProblemStatement])
def list_problem_statements(q: str | None = None, theme: str | None = None):
    rows = list(memory.problem_statements.values())
    if theme:
        rows = [r for r in rows if r["theme"] == theme]
    if q:
        needle = q.lower()
        rows = [r for r in rows if needle in r["title"].lower() or needle in r["description"].lower()]
    return rows


@router.put("/{ps_id}", response_model=ProblemStatement)
def update_problem_statement(ps_id: str, body: ProblemStatement, _admin: dict = Depends(require_role("admin"))):
    if ps_id not in memory.problem_statements:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Problem statement not found")
    memory.problem_statements[ps_id] = body.model_dump()
    return memory.problem_statements[ps_id]
