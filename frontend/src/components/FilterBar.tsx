import { useState } from "react";
import type { SystemStatus } from "../types/telemetryEntry";
import "./FilterBar.css";

interface Filters {
  satelliteId: string;
  status: SystemStatus | "";
}

interface FilterBarProps {
  onFilterChange: (filters: Filters) => void;
}

function FilterBar({ onFilterChange }: FilterBarProps) {
  const [satelliteId, setSatelliteId] = useState("");
  const [status, setStatus] = useState<SystemStatus | "">("");

  function handleApply() {
    onFilterChange({ satelliteId, status });
  }

  function handleReset() {
    setSatelliteId("");
    setStatus("");
    onFilterChange({ satelliteId: "", status: "" });
  }

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Satellite ID</label>
        <input
          className="filter-input"
          type="text"
          placeholder="e.g. SAT-001"
          value={satelliteId}
          onChange={(e) => setSatelliteId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Health Status</label>
        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as SystemStatus | "")}
        >
          <option value="">All</option>
          <option value="nominal">Nominal</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="btn-primary" onClick={handleApply}>
          Apply
        </button>
        <button className="btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
