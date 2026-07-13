from uuid import UUID

from app.models.models import Telemetry

from app.database.queries import (
    insert_attitude_state,
    insert_orbital_state,
    insert_power_system_state,
    insert_status,
    insert_thermal_state,
    insert_warning,
    update_warning_resolved_at,
)


class TelemetryPersister:
    """
    Persist telemetry data in the application.
    """

    def __init__(self, satellite_id: UUID):
        self.satellite_id = satellite_id
        self.previous_status = None
        self.warnings = set()

    async def persist_telemetry(self, telemetry: Telemetry) -> None:
        await insert_orbital_state(
            self.satellite_id,
            telemetry.recorded_at,
            telemetry.position.altitude_km,
            telemetry.position.latitude_deg,
            telemetry.position.longitude_deg,
            telemetry.velocity.orbital_velocity_km_per_s,
            telemetry.velocity.ground_track_velocity_km_per_s,
        )
        await insert_power_system_state(
            self.satellite_id,
            telemetry.recorded_at,
            telemetry.power_system.battery_level_pct,
            telemetry.power_system.solar_input_w,
            telemetry.power_system.power_draw_w,
        )
        await insert_thermal_state(
            self.satellite_id,
            telemetry.recorded_at,
            telemetry.thermal.temp_battery_c,
            telemetry.thermal.temp_solar_panels_c,
            telemetry.thermal.temp_electronics_c,
            telemetry.thermal.temp_exterior_c,
        )
        await insert_attitude_state(
            self.satellite_id,
            telemetry.recorded_at,
            telemetry.attitude.pitch_deg,
            telemetry.attitude.roll_deg,
            telemetry.attitude.yaw_deg,
        )
        if self.previous_status != telemetry.mission_state.system_status:
            self.previous_status = telemetry.mission_state.system_status
            await insert_status(
                self.satellite_id,
                telemetry.recorded_at,
                telemetry.mission_state.system_status,
            )
        if telemetry.mission_state.active_warnings != self.warnings:
            new_warnings = telemetry.mission_state.active_warnings.difference(
                self.warnings
            )
            dropped_warnings = self.warnings.difference(
                telemetry.mission_state.active_warnings
            )
            self.warnings = telemetry.mission_state.active_warnings
            # Add new warnings
            for warning in new_warnings:
                await insert_warning(self.satellite_id, telemetry.recorded_at, warning)
            # Resolve dropped warnings
            for warning in dropped_warnings:
                await update_warning_resolved_at(
                    self.satellite_id, telemetry.recorded_at, warning
                )
