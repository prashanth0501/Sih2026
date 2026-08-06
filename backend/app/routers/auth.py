from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db import memory
from app.models.user import TokenResponse, UserLogin, UserPublic, UserRegister

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _to_public(user: dict) -> UserPublic:
    return UserPublic(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        department=user.get("department"),
        year=user.get("year"),
        photo_url=user.get("photo_url"),
    )


@router.post("/register", response_model=TokenResponse)
def register(body: UserRegister):
    if any(u["email"] == body.email for u in memory.users.values()):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    # Self-service registration always creates a participant. Coordinator /
    # SPOC / admin accounts are provisioned separately by an admin — never
    # through a public endpoint.
    uid = memory.new_id("user")
    user = {
        "id": uid,
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": "participant",
        "department": body.department,
        "year": body.year,
        "photo_url": None,
        "created_at": memory.now_iso(),
    }
    memory.users[uid] = user
    token = create_access_token(subject=uid, role=user["role"])
    return TokenResponse(access_token=token, user=_to_public(user))


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin):
    user = next((u for u in memory.users.values() if u["email"] == body.email), None)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    token = create_access_token(subject=user["id"], role=user["role"])
    return TokenResponse(access_token=token, user=_to_public(user))


@router.get("/me", response_model=UserPublic)
def me(user: dict = Depends(get_current_user)):
    return _to_public(user)
