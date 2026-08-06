from pydantic import BaseModel


class PromoPostCreate(BaseModel):
    title: str
    caption: str
    hashtags: list[str] = []
    media_url: str | None = None


class PromoPostPublic(PromoPostCreate):
    id: str
    is_published: bool = True
    created_at: str
    share_count: int = 0


class PromoShareCreate(BaseModel):
    name: str
    usn: str
    post_url: str
    is_public_on_wall: bool = True


class PromoSharePublic(PromoShareCreate):
    id: str
    promo_post_id: str
    platform: str
    submitted_at: str
    count_for_post: int = 0
