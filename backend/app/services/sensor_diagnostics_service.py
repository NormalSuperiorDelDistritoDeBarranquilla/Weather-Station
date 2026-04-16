from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.metrics import METRIC_REGISTRY, interpret_metric
from app.database import utc_now
from app.models.sensor_data import SensorData
from app.schemas.sensor_data import HistoryRange
from app.schemas.sensor_detail import (
    SensorConnectionState,
    SensorDetailPoint,
    SensorDetailResponse,
    SensorIssue,
    SensorPacketSnapshot,
)
from app.services.sensor_data_service import apply_filters, get_latest_record, get_station_activity


SERIES_LIMIT = 720
RECENT_PACKET_LIMIT = 12
FLATLINE_MIN_SAMPLES = 6
FLATLINE_TOLERANCE = {
    "temperature": 0.05,
    "pressure": 0.05,
    "altitude": 0.1,
    "luminosity": 2.0,
    "rain_analog": 5.0,
    "wind_speed": 0.2,
}


@dataclass(frozen=True)
class MetricHealthSnapshot:
    metric_key: str
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
    series: list[SensorDetailPoint]
    recent_packets: list[SensorPacketSnapshot]


def ensure_metric_supported(metric_key: str) -> str:
    if metric_key not in METRIC_REGISTRY or not METRIC_REGISTRY[metric_key].enabled:
        raise ValueError("Sensor no soportado.")
    return metric_key


def get_latest_valid_record(db: Session, metric_key: str, station_id: str | None = None) -> SensorData | None:
    ensure_metric_supported(metric_key)
    column = getattr(SensorData, metric_key)
    statement = select(SensorData).where(column.is_not(None)).order_by(SensorData.timestamp.desc())
    if station_id:
        statement = statement.where(SensorData.station_id == station_id.strip().upper())
    return db.scalar(statement.limit(1))


def fetch_metric_records(
    db: Session,
    metric_key: str,
    range_value: HistoryRange,
    station_id: str | None,
    limit: int = SERIES_LIMIT,
) -> list[SensorData]:
    ensure_metric_supported(metric_key)
    statement = apply_filters(
        select(SensorData).order_by(SensorData.timestamp.desc()),
        range_value=range_value,
        station_id=station_id,
        search=None,
        start_date=None,
        end_date=None,
    ).limit(limit)
    return list(db.scalars(statement))


def get_metric_aggregates(db: Session, metric_key: str, range_value: HistoryRange, station_id: str | None) -> dict[str, float | int | None]:
    ensure_metric_supported(metric_key)
    column = getattr(SensorData, metric_key)
    aggregate_statement = apply_filters(
        select(
            func.count(SensorData.id).label("samples_in_range"),
            func.count(column).label("valid_samples"),
            func.min(column).label("min_value"),
            func.max(column).label("max_value"),
            func.avg(column).label("avg_value"),
        ),
        range_value=range_value,
        station_id=station_id,
        search=None,
        start_date=None,
        end_date=None,
    )
    return dict(db.execute(aggregate_statement).mappings().one())


def calculate_flatline_length(records: list[SensorData], metric_key: str) -> int:
    tolerance = FLATLINE_TOLERANCE[metric_key]
    baseline: float | None = None
    flatline_length = 0

    for record in records:
        value = getattr(record, metric_key)
        if value is None:
            break

        if baseline is None:
            baseline = float(value)
            flatline_length = 1
            continue

        if abs(float(value) - baseline) <= tolerance:
            flatline_length += 1
            continue

        break

    return flatline_length


def resolve_connection_state(
    latest_station_record: SensorData | None,
    station_active: bool,
    latest_value: float | None,
) -> tuple[SensorConnectionState, str]:
    if latest_station_record is None:
        return "awaiting_data", "No hay conexion"
    if not station_active:
        return "offline", "Sin conexion"
    if latest_value is None:
        return "online", "Reporte incompleto"
    return "online", "En linea"


def build_series(records_desc: list[SensorData], metric_key: str) -> list[SensorDetailPoint]:
    series: list[SensorDetailPoint] = []
    for record in reversed(records_desc):
        value = getattr(record, metric_key)
        status, status_label = interpret_metric(metric_key, value)
        series.append(
            SensorDetailPoint(
                timestamp=record.timestamp,
                value=round(value, 2) if value is not None else None,
                missing=value is None,
                status=status,
                status_label=status_label,
            ),
        )
    return series


def build_recent_packets(records_desc: list[SensorData], metric_key: str) -> list[SensorPacketSnapshot]:
    now = utc_now()
    snapshots: list[SensorPacketSnapshot] = []
    for record in records_desc[:RECENT_PACKET_LIMIT]:
        value = getattr(record, metric_key)
        age_minutes = round((now - record.timestamp).total_seconds() / 60, 1)
        snapshots.append(
            SensorPacketSnapshot(
                timestamp=record.timestamp,
                value=round(value, 2) if value is not None else None,
                has_value=value is not None,
                age_minutes=max(age_minutes, 0),
            ),
        )
    return snapshots


def build_sensor_issues(
    *,
    metric_key: str,
    label: str,
    latest_station_record: SensorData | None,
    snapshot: MetricHealthSnapshot,
) -> list[SensorIssue]:
    issues: list[SensorIssue] = []

    if latest_station_record is None:
        issues.append(
            SensorIssue(
                code="awaiting-first-packet",
                severity="critical",
                title="Sin telemetria inicial",
                message=f"Aun no ha llegado ningun paquete para {label.lower()}. La plataforma esta esperando el primer envio desde Arduino o ESP32.",
                detected_at=None,
            ),
        )
        return issues

    if not snapshot.station_active:
        issues.append(
            SensorIssue(
                code="station-offline",
                severity="critical",
                title="Estacion sin conexion",
                message="La estacion quedo fuera de la ventana operativa y este sensor ya no recibe paquetes recientes.",
                detected_at=snapshot.last_packet_at,
            ),
        )

    if not snapshot.current_packet_has_value:
        issues.append(
            SensorIssue(
                code="missing-latest-value",
                severity="warning",
                title="Dato faltante en el ultimo paquete",
                message=f"El ultimo paquete llego, pero {label.lower()} no traia valor. Esto apunta a una lectura parcial o a una falla puntual del sensor.",
                detected_at=snapshot.last_packet_at,
            ),
        )

    if snapshot.last_valid_at is None:
        issues.append(
            SensorIssue(
                code="never-reported",
                severity="critical",
                title="Sensor sin lecturas validas",
                message=f"No existe ninguna lectura valida almacenada para {label.lower()}.",
                detected_at=snapshot.last_packet_at,
            ),
        )
    else:
        minutes_since_valid = (utc_now() - snapshot.last_valid_at).total_seconds() / 60
        if snapshot.station_active and minutes_since_valid > settings.station_active_minutes:
            issues.append(
                SensorIssue(
                    code="stale-valid-reading",
                    severity="warning",
                    title="Lectura valida desactualizada",
                    message=f"La estacion sigue reportando, pero {label.lower()} no entrega un valor valido desde hace {round(minutes_since_valid, 1)} minutos.",
                    detected_at=snapshot.last_valid_at,
                ),
            )

    if snapshot.samples_in_range:
        missing_ratio = snapshot.missing_samples / snapshot.samples_in_range
        if missing_ratio >= 0.4:
            issues.append(
                SensorIssue(
                    code="high-loss-rate",
                    severity="warning",
                    title="Perdida alta de datos",
                    message=f"En el rango analizado falta {round(missing_ratio * 100, 1)}% de las lecturas de {label.lower()}.",
                    detected_at=snapshot.last_packet_at,
                ),
            )
        elif missing_ratio >= 0.15:
            issues.append(
                SensorIssue(
                    code="moderate-loss-rate",
                    severity="info",
                    title="Integridad irregular",
                    message=f"Se detecta ausencia intermitente de datos: {round(missing_ratio * 100, 1)}% del flujo llega incompleto para {label.lower()}.",
                    detected_at=snapshot.last_packet_at,
                ),
            )

    if snapshot.flatline_detected:
        severity = "warning" if snapshot.flatline_length >= 10 else "info"
        issues.append(
            SensorIssue(
                code="flatline-detected",
                severity=severity,
                title="Lectura plana sospechosa",
                message=f"El sensor repitio el mismo valor durante {snapshot.flatline_length} paquetes consecutivos. Conviene revisar si el canal esta congelado.",
                detected_at=snapshot.last_valid_at,
            ),
        )

    return issues


def build_narrative(
    *,
    label: str,
    latest_station_record: SensorData | None,
    snapshot: MetricHealthSnapshot,
) -> str:
    if latest_station_record is None:
        return f"Sin conexion aun para {label.lower()}. La plataforma permanece en espera del primer paquete del microcontrolador."

    if not snapshot.station_active:
        return f"La estacion dejo de reportar y {label.lower()} quedo sin conexion operativa. El ultimo paquete fue recibido el {snapshot.last_packet_at}."

    if snapshot.latest_value is None:
        return f"La estacion sigue en linea, pero {label.lower()} no llego en el ultimo paquete. Hay conectividad, aunque el canal del sensor esta incompleto."

    if snapshot.flatline_detected:
        return f"{label} sigue llegando, pero la lectura luce anormalmente estable. Conviene revisar si el sensor quedo fijo en el ultimo valor."

    if snapshot.completeness_ratio < 0.85:
        return f"{label} esta reportando, pero con integridad irregular dentro del rango. Hay que vigilar la perdida parcial de paquetes."

    return f"{label} se esta recibiendo con buena continuidad y la serie queda lista para analisis detallado."


def build_metric_health_snapshot(
    db: Session,
    metric_key: str,
    range_value: HistoryRange = "24h",
    station_id: str | None = None,
) -> MetricHealthSnapshot:
    metric_key = ensure_metric_supported(metric_key)
    latest_station_record = get_latest_record(db, station_id)
    station_active, station_active_label, last_packet_at = get_station_activity(latest_station_record)
    latest_value = getattr(latest_station_record, metric_key, None) if latest_station_record is not None else None
    latest_status, latest_status_label = interpret_metric(metric_key, latest_value)
    current_packet_has_value = latest_value is not None
    last_valid_record = get_latest_valid_record(db, metric_key, station_id)
    records_desc = fetch_metric_records(db, metric_key, range_value, station_id)
    aggregates = get_metric_aggregates(db, metric_key, range_value, station_id)
    valid_samples = int(aggregates["valid_samples"] or 0)
    samples_in_range = int(aggregates["samples_in_range"] or 0)
    missing_samples = max(samples_in_range - valid_samples, 0)
    completeness_ratio = round((valid_samples / samples_in_range) if samples_in_range else 0, 3)
    flatline_length = calculate_flatline_length(records_desc, metric_key)
    connection_state, connection_label = resolve_connection_state(latest_station_record, station_active, latest_value)

    return MetricHealthSnapshot(
        metric_key=metric_key,
        station_id=latest_station_record.station_id if latest_station_record else (station_id.strip().upper() if station_id else None),
        station_active=station_active,
        station_active_label=station_active_label,
        connection_state=connection_state,
        connection_label=connection_label,
        latest_value=round(latest_value, 2) if latest_value is not None else None,
        latest_status=latest_status,
        latest_status_label=latest_status_label,
        current_packet_has_value=current_packet_has_value,
        last_packet_at=last_packet_at,
        last_valid_at=last_valid_record.timestamp if last_valid_record else None,
        samples_in_range=samples_in_range,
        valid_samples=valid_samples,
        missing_samples=missing_samples,
        completeness_ratio=completeness_ratio,
        min_value=round(float(aggregates["min_value"]), 2) if aggregates["min_value"] is not None else None,
        max_value=round(float(aggregates["max_value"]), 2) if aggregates["max_value"] is not None else None,
        avg_value=round(float(aggregates["avg_value"]), 2) if aggregates["avg_value"] is not None else None,
        flatline_detected=flatline_length >= FLATLINE_MIN_SAMPLES,
        flatline_length=flatline_length,
        series=build_series(records_desc, metric_key),
        recent_packets=build_recent_packets(records_desc, metric_key),
    )


def get_sensor_detail_response(
    db: Session,
    metric_key: str,
    range_value: HistoryRange = "24h",
    station_id: str | None = None,
) -> SensorDetailResponse:
    metric_key = ensure_metric_supported(metric_key)
    definition = METRIC_REGISTRY[metric_key]
    latest_station_record = get_latest_record(db, station_id)
    snapshot = build_metric_health_snapshot(
        db,
        metric_key=metric_key,
        range_value=range_value,
        station_id=station_id,
    )
    issues = build_sensor_issues(
        metric_key=metric_key,
        label=definition.label,
        latest_station_record=latest_station_record,
        snapshot=snapshot,
    )

    return SensorDetailResponse(
        metric_key=metric_key,
        label=definition.label,
        unit=definition.unit,
        description=definition.description,
        range=range_value,
        station_id=snapshot.station_id,
        station_active=snapshot.station_active,
        station_active_label=snapshot.station_active_label,
        connection_state=snapshot.connection_state,
        connection_label=snapshot.connection_label,
        latest_value=snapshot.latest_value,
        latest_status=snapshot.latest_status,
        latest_status_label=snapshot.latest_status_label,
        current_packet_has_value=snapshot.current_packet_has_value,
        last_packet_at=snapshot.last_packet_at,
        last_valid_at=snapshot.last_valid_at,
        samples_in_range=snapshot.samples_in_range,
        valid_samples=snapshot.valid_samples,
        missing_samples=snapshot.missing_samples,
        completeness_ratio=snapshot.completeness_ratio,
        min_value=snapshot.min_value,
        max_value=snapshot.max_value,
        avg_value=snapshot.avg_value,
        flatline_detected=snapshot.flatline_detected,
        flatline_length=snapshot.flatline_length,
        narrative=build_narrative(
            label=definition.label,
            latest_station_record=latest_station_record,
            snapshot=snapshot,
        ),
        issues=issues,
        series=snapshot.series,
        recent_packets=snapshot.recent_packets,
    )
