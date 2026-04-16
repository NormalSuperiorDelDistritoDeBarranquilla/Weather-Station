from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.alerts import AlertsResponse
from app.services.alerts_service import get_alerts_response
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/current", response_model=AlertsResponse)
def current_alerts(
    station_id: str | None = Query(default=None),
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertsResponse:
    return get_alerts_response(db, station_id=station_id)
