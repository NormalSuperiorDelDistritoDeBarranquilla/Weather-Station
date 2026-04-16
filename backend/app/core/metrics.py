from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MetricDefinition:
    key: str
    label: str
    unit: str
    description: str
    enabled: bool = True


METRIC_REGISTRY: dict[str, MetricDefinition] = {
    "temperature": MetricDefinition(
        key="temperature",
        label="Temperatura",
        unit="°C",
        description="Temperatura ambiental capturada por el BMP280.",
    ),
    "pressure": MetricDefinition(
        key="pressure",
        label="Presion atmosferica",
        unit="hPa",
        description="Presion atmosferica medida por el BMP280.",
    ),
    "altitude": MetricDefinition(
        key="altitude",
        label="Altitud",
        unit="m",
        description="Altitud aproximada calculada por el BMP280 usando la presion de referencia.",
    ),
    "luminosity": MetricDefinition(
        key="luminosity",
        label="Luminosidad",
        unit="lux",
        description="Nivel de luz medido por el BH1750.",
    ),
    "rain_analog": MetricDefinition(
        key="rain_analog",
        label="Lluvia analogica",
        unit="raw",
        description="Lectura analogica cruda del sensor MH-RD para humedad o precipitacion.",
    ),
    "wind_speed": MetricDefinition(
        key="wind_speed",
        label="Velocidad del viento",
        unit="km/h",
        description="Velocidad de viento estimada desde el anemometro.",
    ),
    "humidity": MetricDefinition(
        key="humidity",
        label="Humedad",
        unit="%",
        description="Reserva para futura integracion de humedad relativa.",
        enabled=False,
    ),
    "air_quality": MetricDefinition(
        key="air_quality",
        label="Calidad del aire",
        unit="ICA",
        description="Reserva para futura integracion de calidad del aire.",
        enabled=False,
    ),
    "rain": MetricDefinition(
        key="rain",
        label="Lluvia",
        unit="%",
        description="Reserva historica de una version previa del proyecto.",
        enabled=False,
    ),
    "uv_index": MetricDefinition(
        key="uv_index",
        label="Indice UV",
        unit="UV",
        description="Radiacion ultravioleta para futuras expansiones.",
        enabled=False,
    ),
    "soil_moisture": MetricDefinition(
        key="soil_moisture",
        label="Humedad del suelo",
        unit="%",
        description="Soporte futuro para analitica agroambiental.",
        enabled=False,
    ),
}


def enabled_metric_keys() -> list[str]:
    return [metric.key for metric in METRIC_REGISTRY.values() if metric.enabled]


def interpret_metric(metric_key: str, value: float | None) -> tuple[str, str]:
    if value is None:
        return "unknown", "Sin datos"

    if metric_key == "temperature":
        if value >= 32:
            return "high", "Alta"
        if value <= 18:
            return "low", "Baja"
        return "normal", "Normal"

    if metric_key == "pressure":
        if value >= 1018:
            return "high", "Alta"
        if value <= 1005:
            return "low", "Baja"
        return "normal", "Estable"

    if metric_key == "altitude":
        return "normal", "Referencia"

    if metric_key == "luminosity":
        if value >= 10000:
            return "high", "Alta"
        if value >= 1000:
            return "normal", "Media"
        return "low", "Baja"

    if metric_key == "rain_analog":
        if value <= 1200:
            return "high", "Mojado"
        if value <= 2500:
            return "moderate", "Humedad"
        return "normal", "Seco"

    if metric_key == "wind_speed":
        if value >= 60:
            return "high", "Muy fuerte"
        if value >= 40:
            return "high", "Fuerte"
        if value >= 20:
            return "moderate", "Moderado"
        return "normal", "Suave"

    return "normal", "Disponible"
