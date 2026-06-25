import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TelemetryTable from "../components/TelemetryTable";
import type { TelemetryEntryResponse } from "../types/telemetryEntry";

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
  {
    id: 3,
    satelliteId: "SAT-003",
    timestamp: "2024-01-03T14:00:00Z",
    altitude: 200,
    velocity: 9.1,
    status: "critical",
  },
];

function setup(overrides: Partial<Parameters<typeof TelemetryTable>[0]> = {}) {
  const onDelete = vi.fn();
  const onPageChange = vi.fn();
  render(
    <TelemetryTable
      entries={ENTRIES}
      total={3}
      limit={10}
      offset={0}
      onDelete={onDelete}
      onPageChange={onPageChange}
      {...overrides}
    />,
  );
  return { onDelete, onPageChange };
}

describe("TelemetryTable", () => {
  it("shows empty state when no entries are provided", () => {
    setup({ entries: [], total: 0 });
    expect(screen.getByText("No telemetry entries found.")).toBeInTheDocument();
  });

  it("renders a row for each entry", () => {
    setup();
    expect(screen.getByText("SAT-001")).toBeInTheDocument();
    expect(screen.getByText("SAT-002")).toBeInTheDocument();
    expect(screen.getByText("SAT-003")).toBeInTheDocument();
  });

  it("renders status badges with correct labels", () => {
    setup();
    expect(screen.getByText("Nominal")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("sorts by altitude ascending when Altitude header is clicked", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText(/Altitude/));
    const rows = screen.getAllByRole("row").slice(1); // skip header
    // default sort is timestamp desc — after one click altitude desc, after two clicks asc
    // first click: altitude desc (600, 400, 200) → SAT-002, SAT-001, SAT-003
    expect(within(rows[0]).getByText("SAT-002")).toBeInTheDocument();
  });

  it("reverses sort when the same header is clicked twice", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText(/Altitude/));
    await user.click(screen.getByText(/Altitude/));
    const rows = screen.getAllByRole("row").slice(1);
    // altitude asc (200, 400, 600) → SAT-003, SAT-001, SAT-002
    expect(within(rows[0]).getByText("SAT-003")).toBeInTheDocument();
  });

  it("calls onDelete with the correct entry id when Delete is clicked", async () => {
    const user = userEvent.setup();
    const { onDelete } = setup();
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    // Default sort is timestamp desc: SAT-003, SAT-002, SAT-001
    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(3);
  });

  it("shows correct pagination info", () => {
    setup({ entries: ENTRIES.slice(0, 2), total: 5, limit: 2, offset: 0 });
    expect(screen.getByText("1–2 of 5")).toBeInTheDocument();
  });

  it("disables Prev button on the first page", () => {
    setup();
    expect(screen.getByRole("button", { name: /Prev/ })).toBeDisabled();
  });

  it("disables Next button on the last page", () => {
    setup({ total: 3, limit: 10, offset: 0 });
    expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();
  });

  it("calls onPageChange with the next offset when Next is clicked", async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ total: 20, limit: 10, offset: 0 });
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it("calls onPageChange with the previous offset when Prev is clicked", async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ total: 20, limit: 10, offset: 10 });
    await user.click(screen.getByRole("button", { name: /Prev/ }));
    expect(onPageChange).toHaveBeenCalledWith(0);
  });
});
