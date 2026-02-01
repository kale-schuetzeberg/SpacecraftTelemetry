import TelemetryCard from './TelemetryCard'
import type {Telemetry} from '../types/telemetry'
import './TelemetryCardsGrid.css'

interface TelemetryCardsGridProps {
    telemetry: Telemetry;
}

function TelemetryCardsGrid({telemetry}: TelemetryCardsGridProps) {
    return (
        <div className="telemetry-cards-grid">
            <TelemetryCard
                label="Altitude"
                value={telemetry.position.altitude_km}
                unit="km"
                precision={1}
            />
            <TelemetryCard
                label="Velocity"
                value={telemetry.velocity.orbital_velocity_km_per_s}
                unit="km/s"
                precision={2}
            />
            <TelemetryCard
                label="Battery"
                value={telemetry.power_system.battery_level_pct}
                unit="%"
                precision={1}
            />
            <TelemetryCard
                label="Latitude"
                value={telemetry.position.latitude_deg}
                unit="°"
                precision={2}
            />
            <TelemetryCard
                label="Longitude"
                value={telemetry.position.longitude_deg}
                unit="°"
                precision={2}
            />
            <TelemetryCard
                label="Net Power"
                value={telemetry.power_system.net_power_w}
                unit="W"
                precision={0}
            />
            <TelemetryCard
                label="Solar Input"
                value={telemetry.power_system.solar_input_w}
                unit="W"
                precision={0}
            />
            <TelemetryCard
                label="Power Draw"
                value={telemetry.power_system.power_draw_w}
                unit="W"
                precision={0}
            />
            <TelemetryCard
                label="Battery Temp"
                value={telemetry.thermal.temp_battery_c}
                unit="°C"
                precision={1}
            />
            <TelemetryCard
                label="Pitch"
                value={telemetry.attitude.pitch_deg}
                unit="°"
                precision={2}
            />
            <TelemetryCard
                label="Roll"
                value={telemetry.attitude.roll_deg}
                unit="°"
                precision={2}
            />
            <TelemetryCard
                label="Yaw"
                value={telemetry.attitude.yaw_deg}
                unit="°"
                precision={2}
            />
        </div>
    );
}

export default TelemetryCardsGrid;