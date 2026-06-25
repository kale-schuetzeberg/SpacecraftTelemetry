import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import * as api from "../api/telemetry";
import TelemetryDashboard from "../pages/TelemetryDashboard";
import type { TelemetryEntryResponse } from "../types/telemetryEntry";

vi.mock("../api/telemetry");

const ENTRIES: TelemetryEntryResponse[] = [
  {
    id: 1,
    satelliteId: "SAT-001",
    timestamp: "2024-01-01T08:00:00Z",
    altitude: 400,
    velocity: 7.8,
    status: "nominal",
  },
  {
    id: 2,
    satelliteId: "SAT-002",
    timestamp: "2024-01-02T10:00:00Z",
    altitude: 600,
    velocity: 6.5,
    status: "warning",
  },
];

const EMPTY_PAGE = { data: [], total: 0, limit: 10, offset: 0 };
const FULL_PAGE = { data: ENTRIES, total: 2, limit: 10, offset: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.getTelemetry).mockResolvedValue(FULL_PAGE);
  vi.mocked(api.addTelemetry).mockResolvedValue(ENTRIES[0]);
  vi.mocked(api.deleteTelemetry).mockResolvedValue(undefined);
});

describe("TelemetryDashboard", () => {
  it("shows a loading spinner on initial mount", () => {
    // Never resolves during this test — spinner stays visible
    vi.mocked(api.getTelemetry).mockReturnValue(new Promise(() => {}));
    render(<TelemetryDashboard />);
    expect(screen.getByText("Loading telemetry data...")).toBeInTheDocument();
  });

  it("renders entries in the table after the fetch resolves", async () => {
    render(<TelemetryDashboard />);
    expect(await screen.findByText("SAT-001")).toBeInTheDocument();
    expect(screen.getByText("SAT-002")).toBeInTheDocument();
    expect(
      screen.queryByText("Loading telemetry data..."),
    ).not.toBeInTheDocument();
  });

  it("shows an error banner when the fetch fails", async () => {
    vi.mocked(api.getTelemetry).mockRejectedValue(new Error("Network error"));
    render(<TelemetryDashboard />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByText("Loading telemetry data..."),
    ).not.toBeInTheDocument();
  });

  it("calls deleteTelemetry with the entry id and re-fetches when Delete is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(api.getTelemetry)
      .mockResolvedValueOnce(FULL_PAGE) // initial load
      .mockResolvedValueOnce({ ...EMPTY_PAGE, data: [ENTRIES[1]], total: 1 }); // after delete

    render(<TelemetryDashboard />);
    await screen.findByText("SAT-001");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    await waitFor(() =>
      expect(api.deleteTelemetry).toHaveBeenCalledWith(expect.any(Number)),
    );
    expect(api.getTelemetry).toHaveBeenCalledTimes(2);
  });

  it("shows an error banner when delete fails", async () => {
    const user = userEvent.setup();
    vi.mocked(api.deleteTelemetry).mockRejectedValue(
      new Error("Delete failed"),
    );

    render(<TelemetryDashboard />);
    await screen.findByText("SAT-001");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
