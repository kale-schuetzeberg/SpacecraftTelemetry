import './ConnectionStatus.css';

interface ConnectionStatusProps {
  isConnected: boolean;
  latencyMs: number | null;
  packetsLost: number;
}

function ConnectionStatus({ isConnected, latencyMs, packetsLost }: ConnectionStatusProps) {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="status-main">
        <div className="status-dot"></div>
        <span className="status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {isConnected && latencyMs !== null && (
        <div className="status-metrics">
          <span className={`latency ${getLatencyClass(latencyMs)}`}>
            {latencyMs}ms
          </span>
          {packetsLost > 0 && (
            <span className="packet-loss">
              {packetsLost} lost
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getLatencyClass(latencyMs: number): string {
  if (latencyMs < 50) return 'good';
  if (latencyMs < 100) return 'ok';
  return 'poor';
}

export default ConnectionStatus;