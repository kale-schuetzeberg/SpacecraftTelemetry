import { useEffect, useState, useRef } from 'react';
import type {Telemetry, TelemetryEnvelope} from '../types/telemetry';

const WEBSOCKET_URL = 'ws://localhost:8000/ws/telemetry';
const RECONNECT_INTERVAL = 3000;
const TELEMETRY_HISTORY_SIZE = 100;

export function useWebSocket() {
  // State: stores the latest telemetry data
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);

  // State: stores history of telemetry (last 100 data points)
  const [telemetryHistory, setTelemetryHistory] = useState<Telemetry[]>([]);

  // State: connection status
  const [isConnected, setIsConnected] = useState(false);

  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastSequence, setLastSequence] = useState<number>(-1);
  const [packetsLost, setPacketsLost] = useState<number>(0);

  // Ref: stores WebSocket instance (persists across re-renders)
  const ws = useRef<WebSocket | null>(null);

  // Ref: stores reconnection timer ID
  const reconnectTimer = useRef<number | null>(null);

  // Function: connect to WebSocket
  const connect = () => {
    // Create a new WebSocket connection
    ws.current = new WebSocket(WEBSOCKET_URL);

    // Event: connection opened
    ws.current.onopen = () => {
      console.log('Connected to spacecraft telemetry stream');
      setIsConnected(true);

      // Clear any reconnection timer
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    // Event: message received
    ws.current.onmessage = (event) => {
      try {
        const receiveTime = Date.now(); // Capture immediately
        const envelope = JSON.parse(event.data) as TelemetryEnvelope;

        // Calculate latency
        const latency = receiveTime - envelope.send_timestamp_ms;
        setLatencyMs(latency);

        // Detect packet loss
        if (lastSequence >= 0) {
          const expectedSeq = lastSequence + 1;
          if (envelope.sequence_number !== expectedSeq) {
            const lost = envelope.sequence_number - expectedSeq;
            setPacketsLost(prev => prev + lost);
            console.warn(`Packet loss detected: ${lost} packets missing`);
          }
        }
        setLastSequence(envelope.sequence_number);

        // Extract actual telemetry
        const telemetryData = envelope.telemetry;
        setTelemetry(telemetryData);

        // Update history
        setTelemetryHistory((prevHistory) => {
          const newHistory = [...prevHistory, telemetryData];
          if (newHistory.length > TELEMETRY_HISTORY_SIZE) {
            return newHistory.slice(newHistory.length - TELEMETRY_HISTORY_SIZE);
          }
          return newHistory;
        });

      } catch (error) {
        console.error('Failed to parse telemetry:', error);
      }
    };


    // Event: connection closed
    ws.current.onclose = () => {
      console.warn('Connection lost. Reconnecting...');
      setIsConnected(false);

      // Schedule reconnection
      reconnectTimer.current = window.setTimeout(() => {
        connect();
      }, RECONNECT_INTERVAL);
    };

    // Event: error occurred
    ws.current.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };
  };

  // Effect: run once when component mounts
  useEffect(() => {
    // Connect when component mounts
    connect();

    // Cleanup function: runs when component unmounts
    return () => {
      // Clear reconnection timer
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }

      // Close WebSocket connection
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []); // Empty dependency array = run once on mount

  // Return telemetry and connection status
  return { telemetry, telemetryHistory, isConnected, latencyMs, packetsLost };
}