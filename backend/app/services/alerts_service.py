from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.metrics import METRIC_REGISTRY
from app.database import utc_now
from app.models.sensor_data import SensorData
from app.schemas.alerts import AlertsResponse, SensorAlert
from app.services.sensor_diagnostics_service import build_metric_health_snapshot
from app.services.sensor_data_service import get_latest_record, get_station_activity


TEMPERATURE_SOURCE = "M1K1U operational temperature thresholds"
TEMPERATURE_SOURCE_URL = ""
FREEZE_SOURCE = "US National Weather Service Frost/Freeze Criteria"
FREEZE_SOURCE_URL = "https://www.weather.gov/rah/weathercriteria"
PRESSURE_SOURCE = "Met Office Pressure Tendency Guidance"
PRESSURE_SOURCE_URL = "https://weather.metoffice.gov.uk/guides/coast-and-sea/glossary"
WIND_SOURCE = "M1K1U operational wind thresholds"
WIND_SOURCE_URL = ""
RAIN_SOURCE = "M1K1U rain sensor operational thresholds"
RAIN_SOURCE_URL = ""
STATION_SOURCE = "M1K1U operational monitoring"
STATION_SOURCE_URL = ""

SEVERITY_ORDER = {"critical": 3, "warning": 2, "advisory": 1}


@dataclass(frozen=True)
class AlertDefinition:
    code: str
    sensor: str
    severity: str
    title: str
    message: str
    recommendation: str
    current_value: float | None
    unit: str | None
    threshold: str
    source: str
    source_url: str
    triggered_at: datetime


def build_alert(
    *,
    code: str,
    sensor: str,
    severity: str,
    title: str,
    message: str,
    recommendation: str,
    current_value: float | None,
    unit: str | None,
    threshold: str,
    source: str,
    source_url: str,
    triggered_at: datetime,
) -> AlertDefinition:
    return AlertDefinition(
        code=code,
        sensor=sensor,
        severity=severity,
        title=title,
        message=message,
        recommendation=recommendation,
        current_value=round(current_value, 2) if current_value is not None else None,
        unit=unit,
        threshold=threshold,
        source=source,
        source_url=source_url,
        triggered_at=triggered_at,
    )


def get_pressure_reference_record(db: Session, latest_record: SensorData) -> SensorData | None:
    target_time = latest_record.timestamp - timedelta(hours=3)
    statement = (
        select(SensorData)
        .where(
            SensorData.station_id == latest_record.station_id,
            SensorData.pressure.is_not(None),
            SensorData.timestamp <= target_time,
        )
        .order_by(SensorData.timestamp.desc())
        .limit(1)
    )
    return db.scalar(statement)


def evaluate_temperature_alerts(record: SensorData) -> list[AlertDefinition]:
    alerts: list[AlertDefinition] = []
    value = record.temperature
    if value is None:
        return alerts

    if value >= 42:
        alerts.append(
            build_alert(
                code="temperature-extreme",
                sensor="temperature",
                severity="critical",
                title="Temperatura extremadamente alta",
                message="La temperatura medida supera los 42 °C y puede indicar calor ambiental severo.",
                recommendation="Verificar condiciones del entorno y proteger instrumentacion expuesta.",
                current_value=value,
                unit=METRIC_REGISTRY["temperature"].unit,
                threshold="Temperatura >= 42 °C",
                source=TEMPERATURE_SOURCE,
                source_url=TEMPERATURE_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )
    elif value >= 38:
        alerts.append(
            build_alert(
                code="temperature-high",
                sensor="temperature",
                severity="warning",
                title="Temperatura alta",
                message="La temperatura ambiental supera 38 °C y conviene revisar el comportamiento térmico de la estación.",
                recommendation="Monitorear el aumento y revisar ventilacion, sombreado o exposicion directa.",
                current_value=value,
                unit=METRIC_REGISTRY["temperature"].unit,
                threshold="Temperatura >= 38 °C",
                source=TEMPERATURE_SOURCE,
                source_url=TEMPERATURE_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )

    if value <= -2.2:
        alerts.append(
            build_alert(
                code="hard-freeze-risk",
                sensor="temperature",
                severity="critical",
                title="Riesgo de helada fuerte",
                message="La temperatura está por debajo de 28 °F, rango considerado hard freeze por el NWS.",
                recommendation="Proteger instrumentacion y revisar impacto sobre superficies expuestas.",
                current_value=value,
                unit=METRIC_REGISTRY["temperature"].unit,
                threshold="<= -2.2 °C (28 °F)",
                source=FREEZE_SOURCE,
                source_url=FREEZE_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )
    elif value <= 0:
        alerts.append(
            build_alert(
                code="freeze-risk",
                sensor="temperature",
                severity="warning",
                title="Riesgo de congelacion",
                message="La temperatura está en o por debajo de 32 °F, rango asociado a condiciones de freeze warning.",
                recommendation="Activar medidas de proteccion para equipo sensible a congelacion.",
                current_value=value,
                unit=METRIC_REGISTRY["temperature"].unit,
                threshold="<= 0 °C (32 °F)",
                source=FREEZE_SOURCE,
                source_url=FREEZE_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )

    return alerts


def evaluate_pressure_alerts(db: Session, record: SensorData) -> list[AlertDefinition]:
    alerts: list[AlertDefinition] = []
    if record.pressure is None:
        return alerts

    reference_record = get_pressure_reference_record(db, record)
    if reference_record is None or reference_record.pressure is None:
        return alerts

    pressure_change = record.pressure - reference_record.pressure

    if pressure_change <= -6.0:
        alerts.append(
            build_alert(
                code="pressure-falling-very-rapidly",
                sensor="pressure",
                severity="warning",
                title="Descenso muy rapido de presion",
                message="La presion cayo mas de 6.0 hPa en 3 horas, lo que sugiere un cambio meteorologico brusco.",
                recommendation="Seguir la evolucion del sistema y contrastar con viento y lluvia.",
                current_value=pressure_change,
                unit="hPa/3h",
                threshold="Cambio <= -6.0 hPa en 3h",
                source=PRESSURE_SOURCE,
                source_url=PRESSURE_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )
    elif pressure_change <= -3.6:
        alerts.append(
            build_alert(
                code="pressure-falling-quickly",
                sensor="pressure",
                severity="advisory",
                title="Descenso rapido de presion",
                message="La presion cayo entre 3.6 y 6.0 hPa en 3 horas, rango asociado a una variacion relevante.",
                recommendation="Observar si el descenso continua y revisar el comportamiento del resto de sensores.",
                current_value=pressure_change,
                unit="hPa/3h",
                threshold="Cambio entre -3.6 y -6.0 hPa en 3h",
                source=PRESSURE_SOURCE,
                source_url=PRESSURE_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )

    return alerts


def evaluate_wind_alerts(record: SensorData) -> list[AlertDefinition]:
    alerts: list[AlertDefinition] = []
    value = record.wind_speed
    if value is None:
        return alerts

    if value >= 60:
        alerts.append(
            build_alert(
                code="wind-extreme",
                sensor="wind_speed",
                severity="critical",
                title="Viento extremadamente fuerte",
                message="La velocidad del viento supera 60 km/h y puede afectar la estabilidad de la estación o su entorno.",
                recommendation="Revisar soporte mecanico del sistema y continuar el monitoreo de rafagas.",
                current_value=value,
                unit=METRIC_REGISTRY["wind_speed"].unit,
                threshold="Viento >= 60 km/h",
                source=WIND_SOURCE,
                source_url=WIND_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )
    elif value >= 40:
        alerts.append(
            build_alert(
                code="wind-strong",
                sensor="wind_speed",
                severity="warning",
                title="Viento fuerte",
                message="La velocidad del viento supera 40 km/h y merece seguimiento en tiempo real.",
                recommendation="Contrastar con presión, lluvia y comportamiento mecánico de la estación.",
                current_value=value,
                unit=METRIC_REGISTRY["wind_speed"].unit,
                threshold="Viento >= 40 km/h",
                source=WIND_SOURCE,
                source_url=WIND_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )

    return alerts


def evaluate_rain_alerts(record: SensorData) -> list[AlertDefinition]:
    alerts: list[AlertDefinition] = []

    if record.rain_digital == "Lluvia":
        severity = "warning" if record.rain_analog is not None and record.rain_analog <= 1200 else "advisory"
        alerts.append(
            build_alert(
                code="rain-detected",
                sensor="rain_digital",
                severity=severity,
                title="Lluvia detectada",
                message="El canal digital del MH-RD reporta presencia de lluvia o superficie mojada.",
                recommendation="Revisar la evolucion de lluvia analogica y velocidad del viento para seguir el evento.",
                current_value=record.rain_analog,
                unit="raw",
                threshold="lluvia_digital = Lluvia",
                source=RAIN_SOURCE,
                source_url=RAIN_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )

    if record.rain_analog is not None and record.rain_analog <= 900:
        alerts.append(
            build_alert(
                code="rain-analog-saturated",
                sensor="rain_analog",
                severity="warning",
                title="Sensor de lluvia con alta humedad",
                message="La lectura analógica del MH-RD está en un rango muy bajo, compatible con humedad intensa o lluvia sostenida.",
                recommendation="Validar el estado del sensor y contrastar con el canal digital de lluvia.",
                current_value=record.rain_analog,
                unit=METRIC_REGISTRY["rain_analog"].unit,
                threshold="Lluvia analogica <= 900",
                source=RAIN_SOURCE,
                source_url=RAIN_SOURCE_URL,
                triggered_at=record.timestamp,
            ),
        )

    return alerts


def evaluate_station_alerts(active: bool, active_label: str, record: SensorData | None) -> list[AlertDefinition]:
    if active or record is None:
        return []

    minutes_offline = (utc_now() - record.timestamp).total_seconds() / 60
    return [
        build_alert(
            code="station-inactive",
            sensor="station",
            severity="warning",
            title="Estación sin reporte reciente",
            message=f"La estación figura como {active_label.lower()} y no ha enviado datos dentro de la ventana operativa configurada.",
            recommendation="Revisar conectividad, energia, API key y estado del microcontrolador o gateway.",
            current_value=minutes_offline,
            unit="min",
            threshold="Sin datos dentro de la ventana operativa",
            source=STATION_SOURCE,
            source_url=STATION_SOURCE_URL,
            triggered_at=record.timestamp,
        ),
    ]


def evaluate_data_pipeline_alerts(db: Session, station_id: str | None) -> list[AlertDefinition]:
    alerts: list[AlertDefinition] = []

    for metric_key, definition in METRIC_REGISTRY.items():
        if not definition.enabled:
            continue

        snapshot = build_metric_health_snapshot(db, metric_key=metric_key, range_value="24h", station_id=station_id)

        if snapshot.station_active and not snapshot.current_packet_has_value and snapshot.last_packet_at is not None:
            alerts.append(
                build_alert(
                    code=f"{metric_key}-missing-latest",
                    sensor=metric_key,
                    severity="warning",
                    title=f"{definition.label} sin dato reciente",
                    message=f"La estación sigue reportando, pero el último paquete llegó sin valor para {definition.label.lower()}.",
                    recommendation="Revisar cableado, lectura ADC/I2C y construccion del payload enviado por el microcontrolador.",
                    current_value=None,
                    unit=definition.unit,
                    threshold="Campo ausente en el último paquete",
                    source=STATION_SOURCE,
                    source_url=STATION_SOURCE_URL,
                    triggered_at=snapshot.last_packet_at,
                ),
            )

        if snapshot.flatline_detected and snapshot.last_valid_at is not None:
            alerts.append(
                build_alert(
                    code=f"{metric_key}-flatline",
                    sensor=metric_key,
                    severity="warning" if snapshot.flatline_length >= 10 else "advisory",
                    title=f"{definition.label} con lectura plana",
                    message=f"{definition.label} repitio practicamente el mismo valor durante {snapshot.flatline_length} paquetes seguidos.",
                    recommendation="Validar si el sensor sigue midiendo o si el canal quedó congelado en el último valor.",
                    current_value=snapshot.latest_value,
                    unit=definition.unit,
                    threshold=f"Flatline >= 6 paquetes consecutivos ({snapshot.flatline_length} detectados)",
                    source=STATION_SOURCE,
                    source_url=STATION_SOURCE_URL,
                    triggered_at=snapshot.last_valid_at,
                ),
            )

        if snapshot.samples_in_range and snapshot.missing_samples:
            missing_ratio = snapshot.missing_samples / snapshot.samples_in_range
            if missing_ratio >= 0.4 and snapshot.last_packet_at is not None:
                alerts.append(
                    build_alert(
                        code=f"{metric_key}-loss-rate",
                        sensor=metric_key,
                        severity="warning",
                        title=f"{definition.label} con perdida alta de datos",
                        message=f"En las ultimas 24 horas falta {round(missing_ratio * 100, 1)}% de las lecturas esperadas para {definition.label.lower()}.",
                        recommendation="Revisar estabilidad del sensor, del bus de comunicacion y del mapeo del JSON enviado al backend.",
                        current_value=round(missing_ratio * 100, 1),
                        unit="%",
                        threshold="Perdida >= 40% en el rango de 24h",
                        source=STATION_SOURCE,
                        source_url=STATION_SOURCE_URL,
                        triggered_at=snapshot.last_packet_at,
                    ),
                )

    latest_record = get_latest_record(db, station_id)
    if latest_record is not None and latest_record.rain_digital is None:
        alerts.append(
            build_alert(
                code="rain-digital-missing-latest",
                sensor="rain_digital",
                severity="advisory",
                title="Estado digital de lluvia sin dato reciente",
                message="El último paquete no trajo el estado digital del sensor de lluvia.",
                recommendation="Revisar el pin digital del MH-RD y el armado del payload enviado por el ESP32.",
                current_value=None,
                unit=None,
                threshold="Campo rain_digital ausente en el último paquete",
                source=STATION_SOURCE,
                source_url=STATION_SOURCE_URL,
                triggered_at=latest_record.timestamp,
            ),
        )

    return alerts


def sort_alerts(alerts: list[AlertDefinition]) -> list[AlertDefinition]:
    return sorted(
        alerts,
        key=lambda alert: (SEVERITY_ORDER[alert.severity], alert.triggered_at),
        reverse=True,
    )


def serialize_alerts(alerts: list[AlertDefinition]) -> list[SensorAlert]:
    return [
        SensorAlert(
            code=alert.code,
            sensor=alert.sensor,
            severity=alert.severity,
            title=alert.title,
            message=alert.message,
            recommendation=alert.recommendation,
            current_value=alert.current_value,
            unit=alert.unit,
            threshold=alert.threshold,
            source=alert.source,
            source_url=alert.source_url,
            triggered_at=alert.triggered_at,
        )
        for alert in alerts
    ]


def get_alerts_response(db: Session, station_id: str | None = None) -> AlertsResponse:
    latest_record = get_latest_record(db, station_id)
    active, active_label, _ = get_station_activity(latest_record)

    if latest_record is None:
        waiting_alert = build_alert(
            code="station-awaiting-data",
            sensor="station",
            severity="critical",
            title="No hay conexión con la estación",
            message="La plataforma aún no ha recibido ningún paquete desde Arduino, ESP32 o el gateway intermediario.",
            recommendation="Verificar encendido, conectividad WiFi, API Key, endpoint y formato del JSON de envio.",
            current_value=None,
            unit=None,
            threshold="Sin telemetria inicial",
            source=STATION_SOURCE,
            source_url=STATION_SOURCE_URL,
            triggered_at=utc_now(),
        )
        return AlertsResponse(
            station_id=station_id.strip().upper() if station_id else None,
            generated_at=utc_now(),
            active=False,
            active_label="Sin conexión",
            total_alerts=1,
            highest_severity=waiting_alert.severity,
            alerts=serialize_alerts([waiting_alert]),
        )

    alerts = [
        *evaluate_station_alerts(active, active_label, latest_record),
        *evaluate_temperature_alerts(latest_record),
        *evaluate_pressure_alerts(db, latest_record),
        *evaluate_wind_alerts(latest_record),
        *evaluate_rain_alerts(latest_record),
        *evaluate_data_pipeline_alerts(db, latest_record.station_id),
    ]
    sorted_alerts = sort_alerts(alerts)
    highest_severity = sorted_alerts[0].severity if sorted_alerts else None

    return AlertsResponse(
        station_id=latest_record.station_id,
        generated_at=utc_now(),
        active=active,
        active_label=active_label,
        total_alerts=len(sorted_alerts),
        highest_severity=highest_severity,
        alerts=serialize_alerts(sorted_alerts),
    )
