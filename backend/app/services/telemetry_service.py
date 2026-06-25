from datetime import timezone
from sqlalchemy import delete as sql_delete
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.orm import TelemetryEntryRecord
from app.models.schemas import (
    PaginatedResponse,
    SystemStatus,
    TelemetryEntryCreate,
    TelemetryEntryResponse,
)


class TelemetryService:
    def __init__(self, session: Session):
        self._session = session

    def get_all(
        self,
        satellite_id: str | None,
        status: SystemStatus | None,
        limit: int,
        offset: int,
    ) -> PaginatedResponse[TelemetryEntryResponse]:
        base_query = select(TelemetryEntryRecord)
        if satellite_id is not None:
            base_query = base_query.where(
                TelemetryEntryRecord.satellite_id == satellite_id  # type: ignore[arg-type]
            )
        if status is not None:
            base_query = base_query.where(TelemetryEntryRecord.status == status.value)  # type: ignore[arg-type]

        total = self._session.execute(
            select(func.count()).select_from(base_query.subquery())
        ).scalar_one()

        records = (
            self._session.execute(base_query.limit(limit).offset(offset))
            .scalars()
            .all()
        )

        return PaginatedResponse(
            total=total,
            limit=limit,
            offset=offset,
            data=[_to_response(r) for r in records],
        )

    def get_by_satellite_id(self, satellite_id: str) -> TelemetryEntryResponse | None:
        record: TelemetryEntryRecord | None = (
            self._session.execute(
                select(TelemetryEntryRecord)
                .where(TelemetryEntryRecord.satellite_id == satellite_id)  # type: ignore[arg-type]
                .order_by(TelemetryEntryRecord.timestamp.desc())
                .limit(1)
            )
            .scalars()
            .first()
        )
        return _to_response(record) if record else None

    def add(self, entry: TelemetryEntryCreate) -> TelemetryEntryResponse:
        record = TelemetryEntryRecord(
            satellite_id=entry.satellite_id,
            timestamp=entry.timestamp,
            altitude=entry.altitude,
            velocity=entry.velocity,
            status=entry.status.value,
        )
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return _to_response(record)

    def delete(self, id: int) -> bool:
        result = self._session.execute(
            sql_delete(TelemetryEntryRecord).where(
                TelemetryEntryRecord.id == id  # type: ignore[arg-type]
            )
        )
        self._session.commit()
        return result.rowcount > 0


def _to_response(record: TelemetryEntryRecord) -> TelemetryEntryResponse:
    ts = record.timestamp
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return TelemetryEntryResponse(
        id=record.id,
        satellite_id=record.satellite_id,
        timestamp=ts,
        altitude=record.altitude,
        velocity=record.velocity,
        status=SystemStatus(record.status),
    )
