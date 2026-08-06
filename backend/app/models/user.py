from typing import Literal

from pydantic import BaseModel, EmailStr

Role = Literal["participant", "coordinator", "spoc", "admin"]

ROLE_RANK: dict[Role, int] = {"participant": 0, "coordinator": 1, "spoc": 2, "admin": 3}


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    year: int
    usn: str = ""
    github_url: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    department: str | None = None
    year: int | None = None
    usn: str | None = ""
    github_url: str | None = ""
    photo_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
