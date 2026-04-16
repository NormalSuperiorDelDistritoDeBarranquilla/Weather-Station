from __future__ import annotations

from datetime import datetime

from sqlalchemy import Float, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, UtcDateTime, utc_now


class SensorData(Base):
    __tablename__ = "sensor_data"
    __table_args__ = (
        Index("ix_sensor_data_station_id", "station_id"),
        Index("ix_sensor_data_timestamp", "timestamp"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    station_id: Mapped[str] = mapped_column(String(50), nullable=False)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    air_quality: Mapped[float | None] = mapped_column(Float, nullable=True)
    rain: Mapped[float | None] = mapped_column(Float, nullable=True)
    altitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    luminosity: Mapped[float | None] = mapped_column(Float, nullable=True)
    rain_analog: Mapped[float | None] = mapped_column(Float, nullable=True)
    rain_digital: Mapped[str | None] = mapped_column(String(20), nullable=True)
    wind_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(UtcDateTime(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(UtcDateTime(), default=utc_now, nullable=False)
