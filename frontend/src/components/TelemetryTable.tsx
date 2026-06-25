import { useState, useRef, useLayoutEffect } from "react";
import type { TelemetryEntryResponse } from "../types/telemetryEntry";
import "./TelemetryTable.css";

type SortField = "timestamp" | "altitude" | "velocity";
type SortDir = "asc" | "desc";

interface TelemetryTableProps {
  entries: TelemetryEntryResponse[];
  total: number;
  limit: number;
  offset: number;
  onDelete: (id: number) => void;
  onPageChange: (offset: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  nominal: "Nominal",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

function TelemetryTable({
  entries,
  total,
  limit,
  offset,
  onDelete,
  onPageChange,
}: TelemetryTableProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const [padRowHeight, setPadRowHeight] = useState<number | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    if (!tbodyRef.current || entries.length === 0) return;
    const firstRow = tbodyRef.current.querySelector<HTMLTableRowElement>(
      "tr:not(.table-row-pad)",
    );
    if (firstRow) setPadRowHeight(firstRow.getBoundingClientRect().height);
  }, [entries.length]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function sortIndicator(field: SortField) {
    if (field !== sortField)
      return <span className="sort-indicator inactive">↕</span>;
    return (
      <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  }

  const sorted = [...entries].sort((a, b) => {
    let aVal: number, bVal: number;
    if (sortField === "timestamp") {
      aVal = new Date(a.timestamp).getTime();
      bVal = new Date(b.timestamp).getTime();
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <div className="telemetry-table-wrapper">
      {entries.length === 0 ? (
        <div className="table-empty">No telemetry entries found.</div>
      ) : (
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Satellite ID</th>
              <th className="sortable" onClick={() => handleSort("timestamp")}>
                Timestamp {sortIndicator("timestamp")}
              </th>
              <th className="sortable" onClick={() => handleSort("altitude")}>
                Altitude (km) {sortIndicator("altitude")}
              </th>
              <th className="sortable" onClick={() => handleSort("velocity")}>
                Velocity (km/s) {sortIndicator("velocity")}
              </th>
              <th>Health Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {sorted.map((entry) => (
              <tr key={entry.id}>
                <td className="mono">{entry.satelliteId}</td>
                <td className="mono">{formatTimestamp(entry.timestamp)}</td>
                <td className="mono">{entry.altitude.toFixed(1)}</td>
                <td className="mono">{entry.velocity.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${entry.status}`}>
                    {STATUS_LABELS[entry.status]}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(entry.id)}
                    title="Delete entry"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {Array.from(
              { length: Math.max(0, limit - sorted.length) },
              (_, i) => (
                <tr
                  key={`pad-${i}`}
                  className="table-row-pad"
                  style={
                    padRowHeight !== undefined
                      ? { height: padRowHeight }
                      : undefined
                  }
                >
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <span className="pagination-info">
          {total === 0
            ? "0 entries"
            : `${offset + 1}–${Math.min(offset + limit, total)} of ${total}`}
        </span>
        <div className="pagination-controls">
          <button
            className="btn-page"
            onClick={() => onPageChange(offset - limit)}
            disabled={!hasPrev}
          >
            ← Prev
          </button>
          <span className="page-indicator">
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : "—"}
          </span>
          <button
            className="btn-page"
            onClick={() => onPageChange(offset + limit)}
            disabled={!hasNext}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelemetryTable;
