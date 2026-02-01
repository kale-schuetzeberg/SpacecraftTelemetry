import TelemetryGraph from './TelemetryGraph';
import type { Telemetry } from '../types/telemetry';
import './TelemetryGraphs.css';

interface TelemetryGraphsProps {
    telemetryHistory: Telemetry[];
}

function TelemetryGraphs({telemetryHistory}: TelemetryGraphsProps) {
    if (telemetryHistory.length < 10) {
        return null;
    }

    const altitudeData = telemetryHistory.map((t, index) => ({
        name: `${telemetryHistory.length - index}s`,
        altitude: t.position.altitude_km
    }));

    const batteryData = telemetryHistory.map((t, index) => ({
        name: `${telemetryHistory.length - index}s`,
        battery: t.power_system.battery_level_pct
    }));

    const temperatureData = telemetryHistory.map((t, index) => ({
        name: `${telemetryHistory.length - index}s`,
        battery: t.thermal.temp_battery_c,
        solar: t.thermal.temp_solar_panels_c,
        electronics: t.thermal.temp_electronics_c
    }));

    return (
        <div className="telemetry-graphs">
            <h2 className="section-title">Telemetry History</h2>

            <TelemetryGraph
                title="Altitude Over Time"
                data={altitudeData}
                lines={[
                    {dataKey: 'altitude', color: '#00d9ff', name: 'Altitude (km)'}
                ]}
                yAxisLabel="km"
            />

            <TelemetryGraph
                title="Battery Level Over Time"
                data={batteryData}
                lines={[
                    {dataKey: 'battery', color: '#4caf50', name: 'Battery (%)'}
                ]}
                yAxisLabel="%"
            />

            <TelemetryGraph
                title="Temperature Over Time"
                data={temperatureData}
                lines={[
                    {dataKey: 'battery', color: '#ff9800', name: 'Battery (°C)'},
                    {dataKey: 'solar', color: '#f44336', name: 'Solar Panels (°C)'},
                    {dataKey: 'electronics', color: '#2196f3', name: 'Electronics (°C)'}
                ]}
                yAxisLabel="°C"
            />
        </div>
    );
}

export default TelemetryGraphs;