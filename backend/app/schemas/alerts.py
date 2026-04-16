from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


AlertSeverity = Literal["advisory", "warning", "critical"]


class SensorAlert(BaseModel):
    code: str
    sensor: str
    severity: AlertSeverity
    title: str
    message: str
    recommendation: str
    current_value: float | None
    unit: str | None
    threshold: str
    source: str
    source_url: str
    triggered_at: datetime


class AlertsResponse(BaseModel):
    station_id: str | None
    generated_at: datetime
    active: bool
    active_label: str
    total_alerts: int
    highest_severity: AlertSeverity | None
    alerts: list[SensorAlert]
