from __future__ import annotations

from functools import cached_property
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    project_name: str = "M1K1U"
    api_prefix: str = "/api"
    secret_key: str = Field(default="change-this-secret-key", alias="SECRET_KEY")
    jwt_expire_minutes: int = Field(default=720, alias="JWT_EXPIRE_MINUTES")
    sensor_api_key: str = Field(default="m1k1u-sensor-key", alias="SENSOR_API_KEY")
    station_active_minutes: int = Field(default=10, alias="STATION_ACTIVE_MINUTES")
    cors_origin: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="CORS_ORIGIN",
    )
    database_url_env: str | None = Field(default=None, alias="DATABASE_URL")
    session_cookie_name: str = "m1k1u_session"
    local_timezone: str = "America/Bogota"

    @cached_property
    def database_path(self) -> Path:
        return (BASE_DIR / "data" / "m1k1u.db").resolve()

    @property
    def database_url(self) -> str:
        if self.database_url_env:
            url = self.database_url_env.strip()
            # If a plain Postgres URL was provided (postgres:// or postgresql://)
            # and no explicit driver is present, prefer the modern psycopg (psycopg3) driver.
            if "+psycopg" not in url:
                if url.startswith("postgresql://"):
                    url = url.replace("postgresql://", "postgresql+psycopg://", 1)
                elif url.startswith("postgres://"):
                    url = url.replace("postgres://", "postgresql+psycopg://", 1)
            return url
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{self.database_path.as_posix()}"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]


settings = Settings()
