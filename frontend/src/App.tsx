import { Routes, Route } from "react-router-dom";
import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";
import StatusBanner from "./components/StatusBanner";
import TelemetryCardsGrid from "./components/TelemetryCardsGrid";
import TelemetryGraphs from "./components/TelemetryGraphs.tsx";
import LoadingScreen from "./components/LoadingScreen";
import ConnectionStatus from "./components/ConnectionStatus.tsx";
import TelemetryDashboard from "./pages/TelemetryDashboard.tsx";

function SimulatorDashboard() {
  const { telemetry, telemetryHistory, isConnected, latencyMs, packetsLost } =
    useWebSocket();

  return (
    <div className="app">
      <h1>🛰️ Spacecraft Ground Station 🛰️</h1>
      <ConnectionStatus
        isConnected={isConnected}
        latencyMs={latencyMs}
        packetsLost={packetsLost}
      />

      {!telemetry ? (
        <LoadingScreen isConnected={isConnected} />
      ) : (
        <>
          <StatusBanner
            status={telemetry.status.system_status}
            missionTime={telemetry.status.mission_time_s}
          />
          <TelemetryCardsGrid telemetry={telemetry} />
          <TelemetryGraphs telemetryHistory={telemetryHistory} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SimulatorDashboard />} />
      <Route path="/telemetry" element={<TelemetryDashboard />} />
    </Routes>
  );
}

export default App;
