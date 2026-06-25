import { useTelemetryDashboard } from "../hooks/useTelemetryDashboard";
import FilterBar from "../components/FilterBar";
import AddEntryForm from "../components/AddEntryForm";
import TelemetryTable from "../components/TelemetryTable";
import "./TelemetryDashboard.css";

function TelemetryDashboard() {
  const {
    entries,
    total,
    limit,
    offset,
    loading,
    error,
    handleFilterChange,
    handleAdd,
    handleDelete,
    handlePageChange,
    handleRetry,
  } = useTelemetryDashboard();

  return (
    <div className="td-page">
      <header className="td-header">
        <div className="td-title-group">
          <h1 className="td-title">Satellite Telemetry Dashboard</h1>
        </div>
      </header>

      <main className="td-content">
        <AddEntryForm onAdd={handleAdd} />
        <FilterBar onFilterChange={handleFilterChange} />

        {error && (
          <div className="td-error" role="alert">
            <span>{error}</span>
            <button className="td-retry" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="td-loading">
            <span className="td-spinner" />
            Loading telemetry data...
          </div>
        ) : (
          <TelemetryTable
            entries={entries}
            total={total}
            limit={limit}
            offset={offset}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}

export default TelemetryDashboard;
