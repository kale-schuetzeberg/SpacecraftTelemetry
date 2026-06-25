import type {
  PaginatedResponse,
  SystemStatus,
  TelemetryEntryCreate,
  TelemetryEntryResponse,
} from "../types/telemetryEntry";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface GetTelemetryParams {
  satelliteId?: string;
  status?: SystemStatus;
  limit?: number;
  offset?: number;
}

async function request(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(
      "Cannot reach the server — check that the backend is running.",
    );
  }
}

async function throwFromResponse(
  response: Response,
  fallback: string,
): Promise<never> {
  let message = `${fallback} (${response.status})`;
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail) && body.detail.length > 0) {
      message = body.detail.map((e: { msg: string }) => e.msg).join("; ");
    }
  } catch {
    // response body not parseable — keep fallback message
  }
  throw new Error(message);
}

export async function getTelemetry(
  params: GetTelemetryParams = {},
): Promise<PaginatedResponse<TelemetryEntryResponse>> {
  const query = new URLSearchParams();
  if (params.satelliteId) query.set("satellite_id", params.satelliteId);
  if (params.status) query.set("status", params.status);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const response = await request(`${BASE_URL}/telemetry?${query}`);
  if (!response.ok)
    await throwFromResponse(response, "Failed to fetch telemetry");
  return response.json();
}

export async function addTelemetry(
  entry: TelemetryEntryCreate,
): Promise<TelemetryEntryResponse> {
  const response = await request(`${BASE_URL}/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) await throwFromResponse(response, "Failed to add entry");
  return response.json();
}

export async function deleteTelemetry(id: number): Promise<void> {
  const response = await request(`${BASE_URL}/telemetry/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) await throwFromResponse(response, "Failed to delete entry");
}
