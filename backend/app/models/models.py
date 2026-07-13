from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from pydantic import BaseModel


class Position(BaseModel):
    altitude_km: float  # km
    latitude_deg: float  # degrees
    longitude_deg: float  # degrees


class Velocity(BaseModel):
    orbital_velocity_km_per_s: float  # km/s
    ground_track_velocity_km_per_s: float  # km/s


class PowerSystem(BaseModel):
    battery_level_pct: float  # 0-100 percent
    solar_input_w: float  # 0-500W depends on sunlight
    power_draw_w: float  # 200W-300W varies by systems active
    net_power_w: float  # -300-300W solar_input - power_draw


class Thermal(BaseModel):
    temp_battery_c: float  # degrees Celsius
    temp_solar_panels_c: float  # degrees Celsius
    temp_electronics_c: float  # degrees Celsius
    temp_exterior_c: float  # degrees Celsius


class Attitude(BaseModel):
    pitch_deg: float  # degrees
    roll_deg: float  # degrees
    yaw_deg: float  # degrees


class SystemStatus(str, Enum):
    NOMINAL = "nominal"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


class WarningType(str, Enum):
    LOW_FUEL = "low_fuel"
    HIGH_TEMP = "high_temp"
    SENSOR_FAULT = "sensor_fault"
    LOW_ALTITUDE = "low_altitude"
    LOW_BATTERY = "low_battery"


class MissionState(BaseModel):
    system_status: SystemStatus  # nominal, warning, critical, offline
    active_warnings: set[WarningType]  # low_fuel, high_temp, sensor_fault
    mission_time_s: float  # time


class Telemetry(BaseModel):
    recorded_at: datetime
    position: Position
    velocity: Velocity
    power_system: PowerSystem
    thermal: Thermal
    attitude: Attitude
    mission_state: MissionState


SourceType = Literal["simulator", "rocket"]


class TelemetryEnvelope(BaseModel):
    send_timestamp_ms: int
    source: SourceType = "simulator"
    sequence_number: int
    telemetry: Telemetry

    @classmethod
    def create(
        cls, telemetry: Telemetry, sequence: int, source: SourceType = "simulator"
    ):
        return cls(
            send_timestamp_ms=int(datetime.now(timezone.utc).timestamp() * 1000),
            source=source,
            sequence_number=sequence,
            telemetry=telemetry,
        )
