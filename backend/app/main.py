from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import SessionLocal
from app.routers.alerts import router as alerts_router
from app.routers.auth import router as auth_router
from app.routers.sensor_data import router as sensor_data_router
from app.routers.sensors import router as sensors_router
from app.services.seed_service import seed_initial_data


def run_migrations() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)

    alembic_config = Config(str(backend_dir / "alembic.ini"))
    alembic_config.set_main_option("script_location", str(backend_dir / "alembic"))
    alembic_config.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(alembic_config, "head")


@asynccontextmanager
async def lifespan(_: FastAPI):
    run_migrations()
    with SessionLocal() as session:
        seed_initial_data(session)
    yield


app = FastAPI(
    title="M1K1U API",
    summary="Plataforma IoT meteorologica con FastAPI, SQLite y autenticacion segura.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(sensor_data_router, prefix=settings.api_prefix)
app.include_router(alerts_router, prefix=settings.api_prefix)
app.include_router(sensors_router, prefix=settings.api_prefix)


@app.get("/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": settings.project_name}
