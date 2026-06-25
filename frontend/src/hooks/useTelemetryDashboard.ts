import { useState, useEffect } from "react";
import { getTelemetry, addTelemetry, deleteTelemetry } from "../api/telemetry";
import type {
  TelemetryEntryResponse,
  TelemetryEntryCreate,
  SystemStatus,
} from "../types/telemetryEntry";

const LIMIT = 10;

interface Filters {
  satelliteId: string;
  status: SystemStatus | "";
}

export interface TelemetryDashboardState {
  entries: TelemetryEntryResponse[];
  total: number;
  limit: number;
  offset: number;
  loading: boolean;
  error: string | null;
  handleFilterChange: (filters: Filters) => void;
  handleAdd: (entry: TelemetryEntryCreate) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handlePageChange: (offset: number) => void;
  handleRetry: () => void;
}

export function useTelemetryDashboard(): TelemetryDashboardState {
  const [entries, setEntries] = useState<TelemetryEntryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    satelliteId: "",
    status: "",
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchEntries() {
      setLoading(true);
      setError(null);
      try {
        const result = await getTelemetry({
          satelliteId: filters.satelliteId || undefined,
          status: (filters.status as SystemStatus) || undefined,
          limit: LIMIT,
          offset,
        });
        if (!cancelled) {
          setEntries(result.data);
          setTotal(result.total);
        }
      } catch {
        if (!cancelled)
          setError("Failed to load telemetry data. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEntries();
    return () => {
      cancelled = true;
    };
  }, [filters, offset, retryCount]);

  function handleFilterChange(newFilters: Filters) {
    setFilters(newFilters);
    setOffset(0);
  }

  async function handleAdd(entry: TelemetryEntryCreate) {
    setError(null);
    try {
      await addTelemetry(entry);
      // re-fetch current page so the new entry appears
      const result = await getTelemetry({
        satelliteId: filters.satelliteId || undefined,
        status: (filters.status as SystemStatus) || undefined,
        limit: LIMIT,
        offset,
      });
      setEntries(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry.");
      throw err;
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteTelemetry(id);
      // if deleting the last item on a non-first page, step back one page
      const newOffset =
        entries.length === 1 && offset > 0 ? offset - LIMIT : offset;
      const result = await getTelemetry({
        satelliteId: filters.satelliteId || undefined,
        status: (filters.status as SystemStatus) || undefined,
        limit: LIMIT,
        offset: newOffset,
      });
      setOffset(newOffset);
      setEntries(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry.");
    }
  }

  function handlePageChange(newOffset: number) {
    setOffset(newOffset);
  }

  function handleRetry() {
    setRetryCount((c) => c + 1);
  }

  return {
    entries,
    total,
    limit: LIMIT,
    offset,
    loading,
    error,
    handleFilterChange,
    handleAdd,
    handleDelete,
    handlePageChange,
    handleRetry,
  };
}
