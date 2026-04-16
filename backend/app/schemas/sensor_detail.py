from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.sensor_data import HistoryRange


MetricKey = Literal["temperature", "pressure", "altitude", "luminosity", "rain_analog", "wind_speed"]
SensorConnectionState = Literal["online", "offline", "awaiting_data"]
SensorIssueSeverity = Literal["info", "warning", "critical"]


class SensorIssue(BaseModel):
    code: str
    severity: SensorIssueSeverity
    title: str
    message: str
    detected_at: datetime | None


class SensorDetailPoint(BaseModel):
    timestamp: datetime
    value: float | None
    missing: bool
    status: str
    status_label: str


class SensorPacketSnapshot(BaseModel):
    timestamp: datetime
    value: float | None
    has_value: bool
    age_minutes: float


class SensorDetailResponse(BaseModel):
    metric_key: MetricKey
    label: str
    unit: str
    description: str
    range: HistoryRange
    station_id: str | None
    station_active: bool
    station_active_label: str
    connection_state: SensorConnectionState
    connection_label: str
    latest_value: float | None
    latest_status: str
    latest_status_label: str
    current_packet_has_value: bool
    last_packet_at: datetime | None
    last_valid_at: datetime | None
    samples_in_range: int
    valid_samples: int
    missing_samples: int
    completeness_ratio: float
    min_value: float | None
    max_value: float | None
    avg_value: float | None
    flatline_detected: bool
    flatline_length: int
    narrative: str
    issues: list[SensorIssue]
    series: list[SensorDetailPoint]
    recent_packets: list[SensorPacketSnapshot]
