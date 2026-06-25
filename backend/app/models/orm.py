from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TelemetryEntryRecord(Base):
    __tablename__ = "telemetry_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    satellite_id: Mapped[str] = mapped_column(String, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    altitude: Mapped[float] = mapped_column(Float)
    velocity: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String)
