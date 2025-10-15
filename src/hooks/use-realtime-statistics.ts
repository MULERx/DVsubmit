"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Statistics } from "./use-statistics";
import {
  realtimeService,
  RealtimeConnectionStatus,
  RealtimeEvent,
} from "@/lib/realtime/realtime-service";
import {
  StatisticsCalculator,
  ApplicationRecord,
} from "@/lib/statistics/statistics-calculator";
import { StatisticsAPI } from "@/lib/statistics/statistics-api";

export interface UseRealtimeStatisticsOptions {
  enableRealtime?: boolean;
  retryAttempts?: number;
  onError?: (error: Error) => void;
  onConnectionChange?: (status: RealtimeConnectionStatus) => void;
}

export interface UseRealtimeStatisticsReturn {
  data: Statistics | null;
  isLoading: boolean;
  error: Error | null;
  connectionStatus: RealtimeConnectionStatus;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  lastUpdated: Date | null;
}

const DEFAULT_OPTIONS: Required<UseRealtimeStatisticsOptions> = {
  enableRealtime: true,
  retryAttempts: 3,
  onError: () => {},
  onConnectionChange: () => {},
};

export function useRealtimeStatistics(
  options: UseRealtimeStatisticsOptions = {}
): UseRealtimeStatisticsReturn {
  // Extract stable values from options
  const enableRealtime =
    options.enableRealtime ?? DEFAULT_OPTIONS.enableRealtime;
  const retryAttempts = options.retryAttempts ?? DEFAULT_OPTIONS.retryAttempts;

  // Store callback refs to avoid recreating them
  const onErrorRef = useRef(options.onError ?? DEFAULT_OPTIONS.onError);
  const onConnectionChangeRef = useRef(
    options.onConnectionChange ?? DEFAULT_OPTIONS.onConnectionChange
  );

  // Update refs when options change
  useEffect(() => {
    onErrorRef.current = options.onError ?? DEFAULT_OPTIONS.onError;
    onConnectionChangeRef.current =
      options.onConnectionChange ?? DEFAULT_OPTIONS.onConnectionChange;
  }, [options.onError, options.onConnectionChange]);

  // State
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const isUnmountedRef = useRef(false);

  // Fetch statistics from API
  const fetchStatistics = useCallback(async (): Promise<Statistics> => {
    try {
      const data = await StatisticsAPI.fetchStatisticsWithRetry(retryAttempts);
      return data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch statistics");
      onErrorRef.current(error);
      throw error;
    }
  }, [retryAttempts]);

  // Update statistics state
  const updateStatistics = useCallback((newStats: Statistics) => {
    setStatistics(newStats);
    setLastUpdated(new Date());
    setError(null);
  }, []);

  // Handle realtime events
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent<ApplicationRecord>) => {
      // Check for authorization errors
      if (
        event.errors?.some(
          (error) => error.includes("401") || error.includes("Unauthorized")
        )
      ) {
        const authError = new Error(
          "Unauthorized: Please check RLS policies for realtime access"
        );
        setError(authError);
        setConnectionStatus("error");
        onErrorRef.current(authError);
        return;
      }

      // Update statistics incrementally
      setStatistics((currentStats) => {
        if (!currentStats) return currentStats;

        try {
          const updatedStats = StatisticsCalculator.updateFromChange(
            currentStats,
            event.eventType,
            event.new,
            event.old
          );

          // Validate the updated statistics
          if (!StatisticsCalculator.validateStatistics(updatedStats)) {
            console.warn(
              "Statistics validation failed, falling back to API fetch"
            );
            fetchStatistics().then(updateStatistics).catch(console.error);
            return currentStats;
          }

          setLastUpdated(new Date());
          return updatedStats;
        } catch (err) {
          console.error("Error updating statistics from realtime event:", err);
          // Fallback to API fetch
          fetchStatistics().then(updateStatistics).catch(console.error);
          return currentStats;
        }
      });
    },
    [fetchStatistics, updateStatistics]
  );

  // Handle connection status changes
  const handleConnectionStatusChange = useCallback(
    (status: RealtimeConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionChangeRef.current(status);
    },
    []
  );

  // Manual refetch
  const refetch = useCallback(async () => {
    if (isRefetching) return;

    setIsRefetching(true);
    setError(null);

    try {
      const data = await fetchStatistics();
      updateStatistics(data);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to refetch statistics");
      setError(error);
      onErrorRef.current(error);
    } finally {
      setIsRefetching(false);
    }
  }, [isRefetching, fetchStatistics, updateStatistics]);

  // Initialize
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setConnectionStatus("connecting");

        // Initial fetch
        const initialData = await fetchStatistics();
        updateStatistics(initialData);

        // Set up realtime subscription if enabled
        if (enableRealtime) {
          cleanup = realtimeService.subscribe(
            "statistics-applications",
            { table: "applications" },
            handleRealtimeEvent,
            handleConnectionStatusChange
          );
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to initialize statistics");
        setError(error);
        setConnectionStatus("error");
        onErrorRef.current(error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      isUnmountedRef.current = true;
      cleanup?.();
    };
  }, [
    enableRealtime,
    fetchStatistics,
    handleConnectionStatusChange,
    handleRealtimeEvent,
    updateStatistics,
  ]);

  return {
    data: statistics,
    isLoading,
    error,
    connectionStatus,
    refetch,
    isRefetching,
    lastUpdated,
  };
}
