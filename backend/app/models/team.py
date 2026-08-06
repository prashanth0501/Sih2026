from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

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
    usn: str = ""
    department: str
    year: int
    role: str = "member"
    github_url: str = ""


class TeamCreate(BaseModel):
    name: str
    theme: str | None = None
    leader_usn: str = ""
    leader_github_url: str = ""
    members: list[TeamMember] = []


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
    score: int = 80
    feedback: str = ""
    pass_: bool = Field(default=True, alias="pass")

    model_config = ConfigDict(populate_by_name=True)


class LockUpdate(BaseModel):
    locked: bool


class SystemSettings(BaseModel):
    registration_open: bool = True
    level1_open: bool = True
    level2_open: bool = True
