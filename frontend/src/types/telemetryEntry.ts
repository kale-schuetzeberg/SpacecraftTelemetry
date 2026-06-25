export type SystemStatus = "nominal" | "warning" | "critical" | "offline";

export interface TelemetryEntryCreate {
  satelliteId: string;
  timestamp: string;
  altitude: number;
  velocity: number;
  status: SystemStatus;
}

export interface TelemetryEntryResponse {
  id: number;
  satelliteId: string;
  timestamp: string;
  altitude: number;
  velocity: number;
  status: SystemStatus;
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}
