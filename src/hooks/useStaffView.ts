"use client";

import { useState, useEffect } from "react";
import { watchSessions } from "@/lib/session";
import type { PatientSession } from "@/types/PatientSession";
import type { PatientSessionStatus } from "@/types/PatientSessionStatus";

const INACTIVITY_MS = 30_000;
const TICK_INTERVAL_MS = 5_000;

const STATUS_ORDER: Record<PatientSessionStatus, number> = {
  filling: 0,
  submitted: 1,
  inactive: 2,
};

/**
 * Computes effective status client-side.
 * Handles the edge case where a patient closes their browser —
 * Firebase status stays "filling" but lastActivityAt reveals inactivity.
 */
export function getEffectiveStatus(session: PatientSession): PatientSessionStatus {
  if (session.status !== "filling") return session.status;
  const stale =
    Date.now() - new Date(session.lastActivityAt).getTime() > INACTIVITY_MS;
  return stale ? "inactive" : "filling";
}

/**
 * Whether a session should appear on the Staff View.
 * Ghost sessions — inactive with zero fields filled — are hidden.
 * Exported for unit testing.
 */
export function shouldShowSession(session: PatientSession): boolean {
  const isInactive = getEffectiveStatus(session) === "inactive";
  const isEmpty = Object.values(session.formData).every((v) => v === "");
  return !(isInactive && isEmpty);
}

/**
 * Formats a timestamp into a relative "X seconds ago" string.
 */
export function formatRelativeTime(isoString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 1000
  );

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface UseStaffViewReturn {
  sessions: PatientSession[];
  fillingCount: number;
  isLoading: boolean;
  firebaseError: string | null;
}

export function useStaffView(): UseStaffViewReturn {
  const [rawSessions, setRawSessions] = useState<PatientSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Subscribe to Firebase sessions
  useEffect(() => {
    try {
      const unsubscribe = watchSessions((sessions) => {
        setRawSessions(sessions);
        setIsLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect to database";
      setFirebaseError(msg);
      setIsLoading(false);
    }
  }, []);

  // Interval tick to re-render every 5s:
  // - Updates "X seconds ago" display
  // - Recomputes getEffectiveStatus for browser-closed patients
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Filter out empty inactive sessions (0 fields filled + timed out)
  const visibleSessions = rawSessions.filter((s) => shouldShowSession(s));

  // Sort: filling → submitted → inactive, then by lastActivityAt desc
  // tick is used as a dependency to ensure re-sort on interval
  const sessions = [...visibleSessions].sort((a, b) => {
    const statusA = STATUS_ORDER[getEffectiveStatus(a)];
    const statusB = STATUS_ORDER[getEffectiveStatus(b)];
    if (statusA !== statusB) return statusA - statusB;
    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    );
  });

  const fillingCount = sessions.filter(
    (s) => getEffectiveStatus(s) === "filling"
  ).length;

  // Suppress unused variable warning — tick is used to trigger re-render
  void tick;

  return { sessions, fillingCount, isLoading, firebaseError };
}
