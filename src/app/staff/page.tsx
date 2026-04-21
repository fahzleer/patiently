"use client";

export const dynamic = "force-dynamic";

import { useStaffView } from "@/hooks/useStaffView";
import SessionCard from "@/components/staff/SessionCard";
import EmptyState from "@/components/staff/EmptyState";

export default function StaffViewPage() {
  const { sessions, fillingCount, isLoading, firebaseError } = useStaffView();

  if (firebaseError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-2">
            Database not configured
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Firebase credentials are missing. Please set up your{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>{" "}
            file.
          </p>
          <pre className="text-left text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 overflow-auto">
            {`cp .env.example .env.local\n# then fill in your Firebase credentials`}
          </pre>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Staff View</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time patient registration monitoring
            </p>
          </div>

          {/* Active session badge */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            {fillingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold text-slate-700">
              {fillingCount}
            </span>
            <span className="text-sm text-slate-500">
              {fillingCount === 1 ? "active" : "active"}
            </span>
          </div>
        </div>

        {/* Summary bar */}
        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              {fillingCount} filling
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
              {sessions.filter((s) => s.status === "submitted").length} submitted
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />
              {
                sessions.filter(
                  (s) =>
                    s.status === "inactive" ||
                    (s.status === "filling" &&
                      Date.now() - new Date(s.lastActivityAt).getTime() > 30_000)
                ).length
              }{" "}
              timed out
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Loading sessions..."
            aria-busy="true"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"
                aria-hidden="true"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-slate-200 rounded w-32" />
                  <div className="h-6 bg-slate-200 rounded-full w-20" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && <EmptyState />}

        {/* Session grid */}
        {!isLoading && sessions.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label={`${sessions.length} patient ${sessions.length === 1 ? "session" : "sessions"}`}
          >
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
