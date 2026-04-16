from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from math import ceil
from zoneinfo import ZoneInfo

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.metrics import METRIC_REGISTRY, enabled_metric_keys, interpret_metric
from app.database import utc_now
from app.models.sensor_data import SensorData
from app.schemas.sensor_data import (
    LatestSensorDataResponse,
    MetricState,
    MetricStats,
    PublicLandingResponse,
    PublicStationLocation,
    SensorDataCreate,
    SensorDataHistoryResponse,
    SensorDataRead,
    SensorStatsResponse,
)


LOCAL_TIMEZONE = ZoneInfo(settings.local_timezone)
PUBLIC_LOCATION = PublicStationLocation(
    label="Barrio La Playa, Barranquilla, Atlantico, Colombia",
    neighborhood="Barrio La Playa",
    city="Barranquilla",
    region="Atlantico",
    country="Colombia",
)


def normalize_sensor_timestamp(timestamp: datetime | int | float | None) -> datetime:
    if timestamp is None:
        return utc_now()

    if isinstance(timestamp, (int, float)):
        numeric_timestamp = float(timestamp)
        if numeric_timestamp >= 1_000_000_000_000:
            return datetime.fromtimestamp(numeric_timestamp / 1000, tz=timezone.utc)
        if numeric_timestamp >= 946684800:
            return datetime.fromtimestamp(numeric_timestamp, tz=timezone.utc)
        return utc_now()

    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=LOCAL_TIMEZONE)

    return timestamp.astimezone(timezone.utc)


def get_range_floor(range_value: str) -> datetime | None:
    now = utc_now()
    if range_value == "24h":
        return now - timedelta(hours=24)
    if range_value == "7d":
        return now - timedelta(days=7)
    if range_value == "30d":
        return now - timedelta(days=30)
    return None


def date_to_utc_start(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=LOCAL_TIMEZONE).astimezone(timezone.utc)


def date_to_utc_end(value: date) -> datetime:
    return datetime.combine(value, time.max, tzinfo=LOCAL_TIMEZONE).astimezone(timezone.utc)


def apply_filters(
    statement: Select,
    range_value: str,
    station_id: str | None,
    search: str | None,
    start_date: date | None,
    end_date: date | None,
) -> Select:
    if station_id:
        statement = statement.where(SensorData.station_id == station_id.strip().upper())

    if search:
        cleaned_search = f"%{search.strip().upper()}%"
        statement = statement.where(SensorData.station_id.like(cleaned_search))

    range_floor = get_range_floor(range_value)
    if range_floor is not None:
        statement = statement.where(SensorData.timestamp >= range_floor)

    if start_date is not None:
        statement = statement.where(SensorData.timestamp >= date_to_utc_start(start_date))

    if end_date is not None:
        statement = statement.where(SensorData.timestamp <= date_to_utc_end(end_date))

    return statement


def get_latest_record(db: Session, station_id: str | None = None) -> SensorData | None:
    statement = select(SensorData).order_by(SensorData.timestamp.desc())
    if station_id:
        statement = statement.where(SensorData.station_id == station_id.strip().upper())
    return db.scalar(statement.limit(1))


def get_station_activity(record: SensorData | None) -> tuple[bool, str, datetime | None]:
    if record is None:
        return False, "Sin conexion", None

    active_window = timedelta(minutes=settings.station_active_minutes)
    active = utc_now() - record.timestamp <= active_window
    return active, "Activa" if active else "Inactiva", record.timestamp


def create_metric_state(metric_key: str, value: float | None) -> MetricState:
    definition = METRIC_REGISTRY[metric_key]
    status, status_label = interpret_metric(metric_key, value)
    return MetricState(
        key=metric_key,
        label=definition.label,
        unit=definition.unit,
        value=round(value, 2) if value is not None else None,
        status=status,
        status_label=status_label,
        description=definition.description,
    )


def serialize_metric_states(record: SensorData | None) -> dict[str, MetricState]:
    return {
        metric_key: create_metric_state(
            metric_key,
            getattr(record, metric_key, None) if record is not None else None,
        )
        for metric_key in enabled_metric_keys()
    }


def create_sensor_data_record(db: Session, payload: SensorDataCreate) -> SensorData:
    record = SensorData(
        station_id=payload.station_id,
        temperature=payload.temperature,
        pressure=payload.pressure,
        altitude=payload.altitude,
        luminosity=payload.luminosity,
        rain_analog=payload.rain_analog,
        rain_digital=payload.rain_digital,
        wind_speed=payload.wind_speed,
        timestamp=normalize_sensor_timestamp(payload.timestamp),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_latest_response(db: Session, station_id: str | None = None) -> LatestSensorDataResponse:
    latest_record = get_latest_record(db, station_id)
    active, active_label, last_seen = get_station_activity(latest_record)
    return LatestSensorDataResponse(
        station_id=latest_record.station_id if latest_record else (station_id.strip().upper() if station_id else None),
        latest=SensorDataRead.model_validate(latest_record) if latest_record else None,
        active=active,
        active_label=active_label,
        last_seen=last_seen,
        metric_states=serialize_metric_states(latest_record),
    )


def get_history_response(
    db: Session,
    range_value: str,
    start_date: date | None,
    end_date: date | None,
    page: int,
    page_size: int,
    station_id: str | None,
    search: str | None,
) -> SensorDataHistoryResponse:
    base_statement = apply_filters(
        select(SensorData),
        range_value=range_value,
        station_id=station_id,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )

    total = db.scalar(select(func.count()).select_from(base_statement.subquery())) or 0
    statement = base_statement.order_by(SensorData.timestamp.desc()).offset((page - 1) * page_size).limit(page_size)
    records = list(db.scalars(statement))
    total_pages = ceil(total / page_size) if total else 1

    return SensorDataHistoryResponse(
        items=[SensorDataRead.model_validate(record) for record in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        range=range_value,
        station_id=station_id.strip().upper() if station_id else None,
        search=search.strip() if search else None,
        start_date=start_date,
        end_date=end_date,
    )


def get_stats_response(
    db: Session,
    range_value: str,
    station_id: str | None,
    start_date: date | None,
    end_date: date | None,
    search: str | None,
) -> SensorStatsResponse:
    metrics = enabled_metric_keys()

    aggregate_columns = [func.count(SensorData.id).label("total_records")]
    for metric_key in metrics:
        column = getattr(SensorData, metric_key)
        aggregate_columns.extend(
            [
                func.min(column).label(f"{metric_key}_min"),
                func.max(column).label(f"{metric_key}_max"),
                func.avg(column).label(f"{metric_key}_avg"),
            ],
        )

    aggregate_statement = apply_filters(
        select(*aggregate_columns),
        range_value=range_value,
        station_id=station_id,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )
    aggregates = db.execute(aggregate_statement).mappings().one()

    latest_statement = apply_filters(
        select(SensorData).order_by(SensorData.timestamp.desc()),
        range_value=range_value,
        station_id=station_id,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )
    latest_record = db.scalar(latest_statement.limit(1))
    active, active_label, last_seen = get_station_activity(latest_record)

    metric_payload: dict[str, MetricStats] = {}
    for metric_key in metrics:
        current = getattr(latest_record, metric_key, None) if latest_record else None
        avg = aggregates.get(f"{metric_key}_avg")
        min_value = aggregates.get(f"{metric_key}_min")
        max_value = aggregates.get(f"{metric_key}_max")
        status, status_label = interpret_metric(metric_key, current)
        definition = METRIC_REGISTRY[metric_key]
        metric_payload[metric_key] = MetricStats(
            key=metric_key,
            label=definition.label,
            unit=definition.unit,
            current=round(current, 2) if current is not None else None,
            min=round(float(min_value), 2) if min_value is not None else None,
            max=round(float(max_value), 2) if max_value is not None else None,
            avg=round(float(avg), 2) if avg is not None else None,
            status=status,
            status_label=status_label,
            delta_from_average=round(current - float(avg), 2) if current is not None and avg is not None else None,
        )

    return SensorStatsResponse(
        range=range_value,
        station_id=latest_record.station_id if latest_record else (station_id.strip().upper() if station_id else None),
        total_records=int(aggregates["total_records"] or 0),
        generated_at=utc_now(),
        active=active,
        active_label=active_label,
        last_seen=last_seen,
        latest=SensorDataRead.model_validate(latest_record) if latest_record else None,
        metrics=metric_payload,
    )


def get_public_landing_response(db: Session) -> PublicLandingResponse:
    return PublicLandingResponse(
        generated_at=utc_now(),
        location=PUBLIC_LOCATION,
        latest=get_latest_response(db),
        stats_24h=get_stats_response(
            db,
            range_value="24h",
            station_id=None,
            start_date=None,
            end_date=None,
            search=None,
        ),
    )
