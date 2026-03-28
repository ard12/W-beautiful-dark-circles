import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "claude-sonnet-4-20250514")
    AI_TIMEOUT: int = int(os.getenv("AI_TIMEOUT", "15"))
    FALLBACK_MODE: bool = os.getenv("FALLBACK_MODE", "false").lower() == "true"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"

settings = Settings()
