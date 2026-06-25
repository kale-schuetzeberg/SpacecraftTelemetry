import { useState } from "react";
import type {
  TelemetryEntryCreate,
  SystemStatus,
} from "../types/telemetryEntry";
import "./AddEntryForm.css";

interface AddEntryFormProps {
  onAdd: (entry: TelemetryEntryCreate) => Promise<void>;
}

interface FormErrors {
  satelliteId?: string;
  timestamp?: string;
  altitude?: string;
  velocity?: string;
  status?: string;
}

function AddEntryForm({ onAdd }: AddEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [satelliteId, setSatelliteId] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [altitude, setAltitude] = useState("");
  const [velocity, setVelocity] = useState("");
  const [status, setStatus] = useState<SystemStatus>("nominal");

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!satelliteId.trim()) e.satelliteId = "Satellite ID is required";
    if (!timestamp) e.timestamp = "Timestamp is required";
    if (!altitude || isNaN(Number(altitude)) || Number(altitude) <= 0)
      e.altitude = "Altitude must be a positive number";
    if (!velocity || isNaN(Number(velocity)) || Number(velocity) <= 0)
      e.velocity = "Velocity must be a positive number";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onAdd({
        satelliteId: satelliteId.trim(),
        timestamp: new Date(timestamp).toISOString(),
        altitude: Number(altitude),
        velocity: Number(velocity),
        status,
      });
      setSatelliteId("");
      setTimestamp("");
      setAltitude("");
      setVelocity("");
      setStatus("nominal");
      setIsOpen(false);
    } catch {
      // error surfaced by parent (e.g. error banner); form stays open
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-entry-form">
      <button className="btn-toggle" onClick={() => setIsOpen((o) => !o)}>
        {isOpen ? "✕ Cancel" : "+ Add Entry"}
      </button>

      {isOpen && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="entry-satelliteId">
                Satellite ID
              </label>
              <input
                id="entry-satelliteId"
                className={`form-input ${errors.satelliteId ? "input-error" : ""}`}
                type="text"
                placeholder="e.g. SAT-001"
                value={satelliteId}
                onChange={(e) => setSatelliteId(e.target.value)}
              />
              {errors.satelliteId && (
                <span className="error-msg">{errors.satelliteId}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entry-timestamp">
                Timestamp
              </label>
              <input
                id="entry-timestamp"
                className={`form-input ${errors.timestamp ? "input-error" : ""}`}
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
              />
              {errors.timestamp && (
                <span className="error-msg">{errors.timestamp}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entry-altitude">
                Altitude (km)
              </label>
              <input
                id="entry-altitude"
                className={`form-input ${errors.altitude ? "input-error" : ""}`}
                type="number"
                placeholder="e.g. 400"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                min="0.001"
                step="any"
              />
              {errors.altitude && (
                <span className="error-msg">{errors.altitude}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entry-velocity">
                Velocity (km/s)
              </label>
              <input
                id="entry-velocity"
                className={`form-input ${errors.velocity ? "input-error" : ""}`}
                type="number"
                placeholder="e.g. 7.8"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                min="0.001"
                step="any"
              />
              {errors.velocity && (
                <span className="error-msg">{errors.velocity}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entry-status">
                Health Status
              </label>
              <select
                id="entry-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as SystemStatus)}
              >
                <option value="nominal">Nominal</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <button
            className="btn-primary btn-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Entry"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddEntryForm;
