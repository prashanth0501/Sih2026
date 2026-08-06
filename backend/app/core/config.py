from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All config comes from environment variables — never hard-coded,
    per ARCHITECTURE.md section 10. A .env file is convenient for local
    dev; production sets these in the hosting platform's dashboard.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Ignite — SIH 2026 Portal API"
    environment: str = "development"

    jwt_secret: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 12

    cors_origins: list[str] = [
        "https://sih2026.pages.dev",
        "https://*.pages.dev",
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    mongodb_uri: str = ""
    mongodb_db_name: str = "ignite_sih"

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""


settings = Settings()
