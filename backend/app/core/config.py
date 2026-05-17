from __future__ import annotations

from functools import cached_property
from pathlib import Path
from importlib import import_module

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
    public_station_id: str = Field(default="M1K1U-001", alias="PUBLIC_STATION_ID")
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

    @cached_property
    def postgres_driver(self) -> str | None:
        # Prefer the modern PostgreSQL driver first; keep pg8000 as a pure-Python fallback.
        candidates = (
            ("psycopg", "psycopg"),
            ("pg8000", "pg8000"),
            ("psycopg2", "psycopg2"),
        )
        for driver, module_name in candidates:
            try:
                import_module(module_name)
                return driver
            except Exception:
                continue
        return None

    def _driver_available(self, driver: str) -> bool:
        module_names = {
            "pg8000": "pg8000",
            "psycopg": "psycopg",
            "psycopg2": "psycopg2",
        }
        module_name = module_names.get(driver)
        if module_name is None:
            return False

        try:
            import_module(module_name)
            return True
        except Exception:
            return False

    @property
    def database_url(self) -> str:
        if self.database_url_env:
            url = self.database_url_env.strip()
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)

            driver = self.postgres_driver
            if url.startswith("postgresql+"):
                configured_driver = url.split("://", 1)[0].split("+", 1)[1]
                if self._driver_available(configured_driver) or driver is None:
                    return url
                return f"postgresql+{driver}://{url.split('://', 1)[1]}"

            if driver and url.startswith("postgresql://"):
                return url.replace("postgresql://", f"postgresql+{driver}://", 1)

            return url
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{self.database_path.as_posix()}"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]


settings = Settings()
