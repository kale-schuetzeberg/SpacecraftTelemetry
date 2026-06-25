from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.models.schemas import (
    PaginatedResponse,
    SystemStatus,
    TelemetryEntryCreate,
    TelemetryEntryResponse,
)
from app.services.telemetry_service import TelemetryService

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


def get_service(session: Session = Depends(get_session)) -> TelemetryService:
    return TelemetryService(session)


@router.get("")
def get_telemetry(
    satellite_id: str | None = None,
    status: SystemStatus | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    service: TelemetryService = Depends(get_service),
) -> PaginatedResponse[TelemetryEntryResponse]:
    return service.get_all(satellite_id, status, limit, offset)


@router.get("/{satellite_id}")
def get_telemetry_by_id(
    satellite_id: str,
    service: TelemetryService = Depends(get_service),
) -> TelemetryEntryResponse:
    entry = service.get_by_satellite_id(satellite_id)
    if not entry:
        raise HTTPException(
            status_code=404,
            detail=f"No telemetry found for satellite '{satellite_id}'",
        )
    return entry


@router.post("", status_code=201)
def add_telemetry(
    entry: TelemetryEntryCreate,
    service: TelemetryService = Depends(get_service),
) -> TelemetryEntryResponse:
    return service.add(entry)


@router.delete("/{id}", status_code=204)
def delete_telemetry(
    id: int,
    service: TelemetryService = Depends(get_service),
) -> None:
    deleted = service.delete(id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"No telemetry entry found with id '{id}'",
        )
