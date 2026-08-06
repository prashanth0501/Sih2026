from pydantic import BaseModel


class ProblemStatement(BaseModel):
    id: str
    sih_id: str | None = None
    title: str
    organization: str | None = None
    theme: str
    category: str | None = None
    description: str
    difficulty: str | None = None


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    category: str | None = None


class AnnouncementPublic(AnnouncementCreate):
    id: str
    author_id: str
    published_at: str
    is_published: bool = True


class ContentBlock(BaseModel):
    slug: str
    type: str
    payload: dict


class PublicStats(BaseModel):
    teams_registered: int
    ideas_submitted: int
    problem_statements: int
    days_to_deadline: int


class AdminStats(BaseModel):
    total_teams: int
    total_students: int
    by_stage: dict[str, int]
    selected: int
