from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.metrics import enabled_metric_keys


HistoryRange = Literal["24h", "7d", "30d", "all"]


class SensorDataBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    station_id: str = Field(
        default="M1K1U-001",
        min_length=3,
        max_length=50,
        validation_alias=AliasChoices("station_id", "stationId"),
    )
    temperature: float | None = Field(
        default=None,
        ge=-80,
        le=100,
        validation_alias=AliasChoices("temperature", "temperatura_C"),
    )
    pressure: float | None = Field(
        default=None,
        ge=800,
        le=1200,
        validation_alias=AliasChoices("pressure", "presion_hPa"),
    )
    altitude: float | None = Field(
        default=None,
        ge=-500,
        le=9000,
        validation_alias=AliasChoices("altitude", "altitud_m"),
    )
    luminosity: float | None = Field(
        default=None,
        ge=0,
        le=200000,
        validation_alias=AliasChoices("luminosity", "luminosidad_lux"),
    )
    rain_analog: float | None = Field(
        default=None,
        ge=0,
        le=4095,
        validation_alias=AliasChoices("rain_analog", "lluvia_analog"),
    )
    rain_digital: str | None = Field(
        default=None,
        max_length=20,
        validation_alias=AliasChoices("rain_digital", "lluvia_digital"),
    )
    wind_speed: float | None = Field(
        default=None,
        ge=0,
        le=250,
        validation_alias=AliasChoices("wind_speed", "velViento_kmh"),
    )

    @field_validator("station_id")
    @classmethod
    def normalize_station_id(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("rain_digital", mode="before")
    @classmethod
    def normalize_rain_digital(cls, value: object) -> str | None:
        if value is None:
            return None

        cleaned = str(value).strip().lower()
        if not cleaned:
            return None

        if cleaned in {"lluvia", "rain", "wet", "low", "1", "true"}:
            return "Lluvia"
        if cleaned in {"seco", "dry", "high", "0", "false"}:
            return "Seco"
        return cleaned.capitalize()


class SensorDataCreate(SensorDataBase):
    timestamp: datetime | int | float | None = None

    @model_validator(mode="after")
    def validate_at_least_one_metric(self) -> "SensorDataCreate":
        has_numeric_metric = any(getattr(self, metric_key) is not None for metric_key in enabled_metric_keys())
        if not has_numeric_metric and self.rain_digital is None:
            raise ValueError("Debe enviarse al menos una metrica valida del sensor.")
        return self


class SensorDataRead(SensorDataBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    created_at: datetime


class MetricState(BaseModel):
    key: str
    label: str
    unit: str
    value: float | None
    status: str
    status_label: str
    description: str


class MetricStats(BaseModel):
    key: str
    label: str
    unit: str
    current: float | None
    min: float | None
    max: float | None
    avg: float | None
    status: str
    status_label: str
    delta_from_average: float | None


class LatestSensorDataResponse(BaseModel):
    station_id: str | None
    latest: SensorDataRead | None
    active: bool
    active_label: str
    last_seen: datetime | None
    metric_states: dict[str, MetricState]


class SensorDataHistoryResponse(BaseModel):
    items: list[SensorDataRead]
    total: int
    page: int
    page_size: int
    total_pages: int
    range: HistoryRange
    station_id: str | None
    search: str | None
    start_date: date | None
    end_date: date | None


class SensorStatsResponse(BaseModel):
    range: HistoryRange
    station_id: str | None
    total_records: int
    generated_at: datetime
    active: bool
    active_label: str
    last_seen: datetime | None
    latest: SensorDataRead | None
    metrics: dict[str, MetricStats]


class PublicStationLocation(BaseModel):
    label: str
    neighborhood: str
    city: str
    region: str
    country: str


class PublicLandingResponse(BaseModel):
    generated_at: datetime
    location: PublicStationLocation
    latest: LatestSensorDataResponse
    stats_24h: SensorStatsResponse
