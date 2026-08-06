from typing import Literal

from pydantic import BaseModel, EmailStr

ScreeningStatus = Literal[
    "registered",
    "l1_submitted",
    "l1_under_review",
    "l1_cleared",
    "l1_rejected",
    "l2_submitted",
    "l2_under_review",
    "selected",
    "l2_rejected",
]

# Only these transitions are legal — the screening service is the only code
# allowed to move a team between states (ARCHITECTURE.md section 6).
ALLOWED_TRANSITIONS: dict[ScreeningStatus, list[ScreeningStatus]] = {
    "registered": ["l1_submitted"],
    "l1_submitted": ["l1_under_review"],
    "l1_under_review": ["l1_cleared", "l1_rejected"],
    "l1_cleared": ["l2_submitted"],
    "l1_rejected": [],
    "l2_submitted": ["l2_under_review"],
    "l2_under_review": ["selected", "l2_rejected"],
    "selected": [],
    "l2_rejected": [],
}


class TeamMember(BaseModel):
    name: str
    email: EmailStr
    department: str
    year: int
    role: str = "member"


class TeamCreate(BaseModel):
    name: str
    theme: str | None = None


class ScreeningRound(BaseModel):
    status: str = "pending"
    score: int | None = None
    feedback: str | None = None
    submission_url: str | None = None
    reviewer_id: str | None = None
    reviewed_at: str | None = None


class TeamPublic(BaseModel):
    id: str
    name: str
    leader_id: str
    problem_statement_id: str | None
    theme: str | None
    members: list[TeamMember]
    status: ScreeningStatus
    is_locked: bool = False
    viewer_is_leader: bool = True
    level1: ScreeningRound
    level2: ScreeningRound
    created_at: str
    updated_at: str


class SubmissionCreate(BaseModel):
    level: Literal[1, 2]
    submission_url: str


class ReviewDecision(BaseModel):
    score: int
    feedback: str
    pass_: bool


class LockUpdate(BaseModel):
    locked: bool
