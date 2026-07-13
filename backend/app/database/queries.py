from datetime import datetime
from uuid import UUID

from asyncpg import Record

from app.models.models import SystemStatus, WarningType

from .connection import get_pool


async def seed_satellite(name: str) -> Record | None:
    """Insert or retrieve a satellite by name."""
    pool = get_pool()
    # borrow a connection, call it conn, and give it back when done
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO satellites (satellite_name, mission_start_time) "
            "VALUES (($1), CURRENT_TIMESTAMP) "
            "ON CONFLICT (satellite_name) DO UPDATE SET satellite_name = EXCLUDED.satellite_name "
            "RETURNING id",
            name,
        )
        return row


async def retrieve_satellite_id(name: str) -> Record | None:
    """Get a satellite by satellite_name."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM satellites WHERE satellite_name = $1", name
        )
        return row


async def satellite_exists(satellite_id: UUID) -> bool:
    """Determine if a satellite exists by satellite_id."""
    pool = get_pool()
    async with pool.acquire() as conn:
        return await conn.fetchval(
            "SELECT EXISTS(SELECT 1 FROM satellites WHERE id = $1)", satellite_id
        )


async def retrieve_satellites() -> list[Record]:
    """Retrieve all satellites."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, satellite_name FROM satellites")
        return rows


async def retrieve_attitude_states(
    satellite_id: UUID, start_datetime: datetime, end_datetime: datetime
) -> list[Record]:
    """Retrieve all attitude states for a satellite within a given time range."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT recorded_at, pitch_deg, roll_deg, yaw_deg "
            "FROM attitudes "
            "WHERE satellite_id = $1 AND recorded_at >= $2 AND recorded_at < $3 "
            "ORDER BY recorded_at ASC",
            satellite_id,
            start_datetime,
            end_datetime,
        )
        return rows


async def retrieve_orbital_states(
    satellite_id: UUID, start_datetime: datetime, end_datetime: datetime
) -> list[Record]:
    """Retrieve all orbital states for a satellite within a given time range."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT recorded_at, altitude_km, latitude_deg, longitude_deg, orbital_velocity_km_per_s, ground_track_velocity_km_per_s "
            "FROM orbital_states "
            "WHERE satellite_id = $1 AND recorded_at >= $2 AND recorded_at < $3 "
            "ORDER BY recorded_at ASC",
            satellite_id,
            start_datetime,
            end_datetime,
        )
        return rows


async def retrieve_power_system_states(
    satellite_id: UUID, start_datetime: datetime, end_datetime: datetime
) -> list[Record]:
    """Retrieve all power system states for a satellite within a given time range."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT recorded_at, battery_level_pct, solar_input_w, power_draw_w "
            "FROM power_systems "
            "WHERE satellite_id = $1 AND recorded_at >= $2 AND recorded_at < $3 "
            "ORDER BY recorded_at ASC",
            satellite_id,
            start_datetime,
            end_datetime,
        )
        return rows


async def retrieve_thermal_states(
    satellite_id: UUID, start_datetime: datetime, end_datetime: datetime
) -> list[Record]:
    """Retrieve all thermal states for a satellite within a given time range."""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT recorded_at, temp_battery_c, temp_solar_panels_c, temp_electronics_c, temp_exterior_c "
            "FROM thermals "
            "WHERE satellite_id = $1 AND recorded_at >= $2 AND recorded_at < $3 "
            "ORDER BY recorded_at ASC",
            satellite_id,
            start_datetime,
            end_datetime,
        )
        return rows


async def insert_orbital_state(
    satellite_id: UUID,
    recorded_at: datetime,
    altitude_km: float,
    latitude_deg: float,
    longitude_deg: float,
    orbital_velocity_km_per_s: float,
    ground_track_velocity_km_per_s: float,
) -> None:
    """Insert an orbital state for a satellite."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO orbital_states (satellite_id, recorded_at, altitude_km, latitude_deg, longitude_deg, orbital_velocity_km_per_s, ground_track_velocity_km_per_s) "
            "VALUES ($1, $2, $3, $4, $5, $6, $7)",
            satellite_id,
            recorded_at,
            altitude_km,
            latitude_deg,
            longitude_deg,
            orbital_velocity_km_per_s,
            ground_track_velocity_km_per_s,
        )


async def insert_power_system_state(
    satellite_id: UUID,
    recorded_at: datetime,
    battery_level_pct: float,
    solar_input_w: float,
    power_draw_w: float,
) -> None:
    """Insert a power system state for a satellite."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO power_systems (satellite_id, recorded_at, battery_level_pct, solar_input_w, power_draw_w) "
            "VALUES ($1, $2, $3, $4, $5)",
            satellite_id,
            recorded_at,
            battery_level_pct,
            solar_input_w,
            power_draw_w,
        )


async def insert_thermal_state(
    satellite_id: UUID,
    recorded_at: datetime,
    temp_battery_c: float,
    temp_solar_panels_c: float,
    temp_electronics_c: float,
    temp_exterior_c: float,
) -> None:
    """Insert a thermal state for a satellite."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO thermals (satellite_id, recorded_at, temp_battery_c, temp_solar_panels_c, temp_electronics_c, temp_exterior_c) "
            "VALUES ($1, $2, $3, $4, $5, $6)",
            satellite_id,
            recorded_at,
            temp_battery_c,
            temp_solar_panels_c,
            temp_electronics_c,
            temp_exterior_c,
        )


async def insert_attitude_state(
    satellite_id: UUID,
    recorded_at: datetime,
    pitch_deg: float,
    roll_deg: float,
    yaw_deg: float,
) -> None:
    """Insert an attitude state for a satellite."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO attitudes (satellite_id, recorded_at, pitch_deg, roll_deg, yaw_deg) "
            "VALUES ($1, $2, $3, $4, $5)",
            satellite_id,
            recorded_at,
            pitch_deg,
            roll_deg,
            yaw_deg,
        )


async def insert_status(
    satellite_id: UUID, recorded_at: datetime, system_status: SystemStatus
) -> None:
    """Insert a status state for a satellite."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO statuses (satellite_id, recorded_at, system_status) "
            "VALUES ($1, $2, $3)",
            satellite_id,
            recorded_at,
            system_status,
        )


async def insert_warning(
    satellite_id: UUID, recorded_at: datetime, warning: WarningType
) -> None:
    """Insert a warning state for a satellite."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO warnings (satellite_id, recorded_at, warning) "
            "VALUES ($1, $2, $3)",
            satellite_id,
            recorded_at,
            warning,
        )


async def update_warning_resolved_at(
    satellite_id: UUID, resolved_at: datetime, warning: WarningType
) -> None:
    """Update a warning resolved_at timestamp."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE warnings SET resolved_at = $2 WHERE satellite_id = $1 AND warning = $3 AND resolved_at IS NULL",
            satellite_id,
            resolved_at,
            warning,
        )
