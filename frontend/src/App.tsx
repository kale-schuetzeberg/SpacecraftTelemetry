import './App.css'
import {useWebSocket} from './hooks/useWebSocket';
import StatusBanner from './components/StatusBanner'
import TelemetryCardsGrid from './components/TelemetryCardsGrid';
import TelemetryGraphs from "./components/TelemetryGraphs.tsx";
import LoadingScreen from "./components/LoadingScreen";
import ConnectionStatus from "./components/ConnectionStatus.tsx";

function App() {
    // Connect to WebSocket and get live telemetry
    const {telemetry, telemetryHistory, isConnected, latencyMs, packetsLost} = useWebSocket();

    // Telemetry received! Render dashboard
    return (
        <div className="app">
            <h1>🛰️ Spacecraft Ground Station 🛰️</h1>
            <ConnectionStatus
                isConnected={isConnected}
                latencyMs={latencyMs}
                packetsLost={packetsLost}
            />

            {!telemetry ? (
                <LoadingScreen isConnected={isConnected}/>
            ) : (
                <>
                    <StatusBanner
                        status={telemetry.status.system_status}
                        missionTime={telemetry.status.mission_time_s}
                    />

                    <TelemetryCardsGrid telemetry={telemetry}/>

                    <TelemetryGraphs telemetryHistory={telemetryHistory}/>
                </>
            )}
        </div>
    );
}

export default App
