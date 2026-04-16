from __future__ import annotations

from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.schemas.sensor_data import (
    LatestSensorDataResponse,
    PublicLandingResponse,
    SensorDataCreate,
    SensorDataHistoryResponse,
    SensorDataRead,
    SensorStatsResponse,
)
from app.services.auth_service import get_current_user
from app.services.sensor_data_service import (
    create_sensor_data_record,
    get_history_response,
    get_latest_response,
    get_public_landing_response,
    get_stats_response,
)

HistoryRange = Literal["24h", "7d", "30d", "all"]

router = APIRouter(prefix="/sensor-data", tags=["sensor-data"])


def require_sensor_api_key(
    x_api_key: Annotated[str | None, Header(alias="X-API-Key")] = None,
) -> None:
    if x_api_key != settings.sensor_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key invalida para la estacion.",
        )


@router.post("", response_model=SensorDataRead, status_code=status.HTTP_201_CREATED)
def create_sensor_data(
    payload: SensorDataCreate,
    _: None = Depends(require_sensor_api_key),
    db: Session = Depends(get_db),
) -> SensorDataRead:
    record = create_sensor_data_record(db, payload)
    return SensorDataRead.model_validate(record)


@router.get("/latest", response_model=LatestSensorDataResponse)
def latest_sensor_data(
    station_id: str | None = Query(default=None),
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LatestSensorDataResponse:
    return get_latest_response(db, station_id=station_id)


@router.get("/public/landing", response_model=PublicLandingResponse)
def public_landing_sensor_data(
    db: Session = Depends(get_db),
) -> PublicLandingResponse:
    return get_public_landing_response(db)


@router.get("/history", response_model=SensorDataHistoryResponse)
def history_sensor_data(
    range_value: Annotated[HistoryRange, Query(alias="range")] = "24h",
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=500),
    station_id: str | None = Query(default=None),
    search: str | None = Query(default=None),
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SensorDataHistoryResponse:
    return get_history_response(
        db,
        range_value=range_value,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
        station_id=station_id,
        search=search,
    )


@router.get("/stats", response_model=SensorStatsResponse)
def sensor_stats(
    range_value: Annotated[HistoryRange, Query(alias="range")] = "24h",
    station_id: str | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    search: str | None = Query(default=None),
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SensorStatsResponse:
    return get_stats_response(
        db,
        range_value=range_value,
        station_id=station_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )
