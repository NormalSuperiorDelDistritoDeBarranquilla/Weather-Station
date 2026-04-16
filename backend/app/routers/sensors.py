from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.sensor_data import HistoryRange
from app.schemas.sensor_detail import SensorDetailResponse
from app.services.auth_service import get_current_user
from app.services.sensor_diagnostics_service import get_sensor_detail_response


MetricKey = Literal["temperature", "pressure", "altitude", "luminosity", "rain_analog", "wind_speed"]

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("/{metric_key}/detail", response_model=SensorDetailResponse)
def sensor_detail(
    metric_key: MetricKey,
    range_value: Annotated[HistoryRange, Query(alias="range")] = "24h",
    station_id: str | None = Query(default=None),
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SensorDetailResponse:
    try:
        return get_sensor_detail_response(
            db,
            metric_key=metric_key,
            range_value=range_value,
            station_id=station_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
