from math import sin, cos, pi
from datetime import datetime, timezone

from app.models.models import (
    Position,
    Velocity,
    PowerSystem,
    Thermal,
    Attitude,
    SystemStatus,
    WarningType,
    Status,
    Telemetry
)

# Constants
EARTH_RADIUS_KM = 6371
ORBITAL_ALTITUDE_KM = 350
ORBITAL_PERIOD_MIN = 90
ORBITAL_PERIOD_S = ORBITAL_PERIOD_MIN * 60
ORBITAL_INCLINATION_DEG = 137 # Retrograde; Firefly Alpha Flight 2 - To The Black
INITIAL_LATITUDE_DEG = 0.0
# INITIAL_LATITUDE_DEG = 34.75 # Vandenberg Air Force Base
INITIAL_LONGITUDE_DEG = 0.0
# INITIAL_LONGITUDE_DEG = -120.52 # Vandenberg Air Force Base

class Simulator:
    """
        Spacecraft simulator using a simple internal state.
    """

    def __init__(self):
        # Position
        self.altitude_km = ORBITAL_ALTITUDE_KM
        self.latitude_deg = 0.0
        self.longitude_deg = 0.0

        # Velocity
        self.orbital_velocity_km_per_s = 7.8
        self.ground_track_velocity_km_per_s = 7.6

        # Power System
        self.battery_level_pct = 100.0
        self.solar_input_w = 450.0
        self.power_draw_w = 250.0

        # Thermal
        self.temp_battery_c = 20.0
        self.temp_solar_panels_c = 15.0
        self.temp_electronics_c = 22.0
        self.temp_exterior_c = -50.0

        # Attitude
        self.pitch_deg = 0.0
        self.roll_deg = 0.0
        self.yaw_deg = 0.0

        # Status
        self.active_warnings = []
        self.mission_time_s = 0.0

        # Pre-calculated constants
        self.max_latitude_deg = 180 - ORBITAL_INCLINATION_DEG
        self.degrees_per_s = 360.0 / ORBITAL_PERIOD_S

        # Environment
        self.in_sunlight = True

        # Telemetry sequence tracking
        self._sequence_number = 0

    def update(self, delta_time_s=1.0):
        """
        Update spacecraft state based on physics simulation.
        """
        # Update Mission Time
        self.mission_time_s += delta_time_s

        # ================================================================================
        # Update Position
        # ================================================================================
        # Calculate orbital position
        orbital_fraction = (self.mission_time_s % ORBITAL_PERIOD_S) / ORBITAL_PERIOD_S

        # Update latitude
        self.latitude_deg = self.max_latitude_deg * sin(2 * pi * orbital_fraction)

        # Update longitude
        self.longitude_deg -= self.degrees_per_s * delta_time_s

        if self.longitude_deg < -180:
            self.longitude_deg += 360
        elif self.longitude_deg > 180:
            self.longitude_deg -= 360

        # TODO: Make velocity variables dynamic
        # ================================================================================
        # Update Velocity
        # ================================================================================
        # Update orbital velocity

        # Update ground track velocity

        # ================================================================================
        # Update Day/Night Cycle
        # ================================================================================

        # 50/50 day/night
        self.in_sunlight = (orbital_fraction % 1.0) < 0.5

        # ================================================================================
        # Update Power System # TODO: Improve Power Simulation
        # ================================================================================

        # Update Solar Input
        if self.in_sunlight:
            self.solar_input_w = 450.0
        else:
            self.solar_input_w = 0.0

        # Update Power Draw
        self.power_draw_w = 250.0 + 20.0 * sin(self.mission_time_s / 100)

        # Update Battery Level
        net_power_w = self.solar_input_w - self.power_draw_w

        # Update Battery Level Percent
        battery_change_pct = (net_power_w / 500.0) * delta_time_s * 0.01
        self.battery_level_pct += battery_change_pct
        self.battery_level_pct = max(0.0, min(100.0, self.battery_level_pct))

        # ================================================================================
        # Update Thermal # TODO: Improve Thermal Simulation
        # ================================================================================

        # Update Solar Panel Temperature and Exterior Temperature
        if self.in_sunlight:
            self.temp_solar_panels_c += 0.5 * delta_time_s
            self.temp_exterior_c += 0.3 * delta_time_s
        else:
            self.temp_solar_panels_c -= 0.4 * delta_time_s
            self.temp_exterior_c -= 0.5 * delta_time_s

        # Update Battery Temperature
        if self.battery_level_pct < 50:
            self.temp_battery_c += 0.1 * delta_time_s
        else:
            self.temp_battery_c -= 0.05 * delta_time_s

        # Update Electronics Temperature
        self.temp_electronics_c = 22.0 + (self.power_draw_w - 250) * 0.05

        # Clamp temperatures
        self.temp_solar_panels_c = max(-100.0, min(150.0, self.temp_solar_panels_c))
        self.temp_exterior_c = max(-150.0, min(150.0, self.temp_exterior_c))
        self.temp_battery_c = max(-20.0, min(60.0, self.temp_battery_c))


        # ================================================================================
        # Update Attitude
        # ================================================================================

        self.pitch_deg += 0.5 * sin(self.mission_time_s / 50)
        self.roll_deg += 0.3 * cos(self.mission_time_s / 40)
        self.yaw_deg += 360 / ORBITAL_PERIOD_MIN / 60

        # self.pitch_deg = self.pitch_deg % 360
        # self.roll_deg = self.roll_deg % 360
        self.yaw_deg = self.yaw_deg % 360

        # ================================================================================
        # Update Status
        # ================================================================================

        # Update Warnings
        self.active_warnings = []

        if self.battery_level_pct < 20:
            self.active_warnings.append(WarningType.LOW_BATTERY)

        if self.temp_electronics_c > 45:
            self.active_warnings.append(WarningType.HIGH_TEMP)

        if self.altitude_km < 320:
            self.active_warnings.append(WarningType.LOW_ALTITUDE)

    def get_system_status(self) -> SystemStatus:
        """Determine overall system status based on warnings"""
        if self.battery_level_pct < 10 or self.temp_electronics_c > 50:
            return SystemStatus.CRITICAL
        elif len(self.active_warnings) > 0:
            return SystemStatus.WARNING
        else:
            return SystemStatus.NOMINAL

    def get_current_telemetry_sequence_number(self) -> int:
        """
        Get the current sequence number for telemetry envelope and increment
        """
        current_sequence_number = self._sequence_number
        self._sequence_number += 1
        return current_sequence_number

    def get_telemetry(self) -> Telemetry:
        """
        Build and return a new Telemetry object from the current internal state.
        """

        # ================================================================================
        # Build Telemetry Object from Internal State
        # ================================================================================
        return Telemetry(
            timestamp=datetime.now(timezone.utc),
            position=Position(
                altitude_km=self.altitude_km,
                latitude_deg=self.latitude_deg,
                longitude_deg=self.longitude_deg
            ),
            velocity=Velocity(
                orbital_velocity_km_per_s=self.orbital_velocity_km_per_s,
                ground_track_velocity_km_per_s=self.ground_track_velocity_km_per_s
            ),
            power_system=PowerSystem(
                battery_level_pct=self.battery_level_pct,
                solar_input_w=self.solar_input_w,
                power_draw_w=self.power_draw_w,
                net_power_w=self.solar_input_w - self.power_draw_w
            ),
            thermal=Thermal(
                temp_battery_c=self.temp_battery_c,
                temp_solar_panels_c=self.temp_solar_panels_c,
                temp_electronics_c=self.temp_electronics_c,
                temp_exterior_c=self.temp_exterior_c
            ),
            attitude=Attitude(
                pitch_deg=self.pitch_deg,
                roll_deg=self.roll_deg,
                yaw_deg=self.yaw_deg
            ),
            status=Status(
                system_status=self.get_system_status(),
                active_warnings=self.active_warnings.copy(),
                mission_time_s=self.mission_time_s
            )
        )