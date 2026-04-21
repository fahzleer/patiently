import { describe, expect, test } from "bun:test";
import { getEffectiveStatus, formatRelativeTime, shouldShowSession } from "./useStaffView";
import type { PatientSession } from "@/types/PatientSession";
import { EMPTY_FORM_DATA } from "@/types/PatientSession";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSession(
  status: PatientSession["status"],
  lastActivitySecondsAgo: number
): PatientSession {
  return {
    id: "test-id",
    status,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date(Date.now() - lastActivitySecondsAgo * 1000).toISOString(),
    formData: { ...EMPTY_FORM_DATA },
  };
}

// ─── getEffectiveStatus ───────────────────────────────────────────────────────

describe("getEffectiveStatus", () => {
  test("returns 'inactive' when status=filling and lastActivityAt > 30s ago", () => {
    const session = makeSession("filling", 35);
    expect(getEffectiveStatus(session)).toBe("inactive");
  });

  test("returns 'filling' when status=filling and lastActivityAt < 30s ago", () => {
    const session = makeSession("filling", 10);
    expect(getEffectiveStatus(session)).toBe("filling");
  });

  test("returns 'filling' when lastActivityAt is exactly at the boundary (29s)", () => {
    const session = makeSession("filling", 29);
    expect(getEffectiveStatus(session)).toBe("filling");
  });

  test("returns 'submitted' unchanged regardless of lastActivityAt", () => {
    const session = makeSession("submitted", 60);
    expect(getEffectiveStatus(session)).toBe("submitted");
  });

  test("returns 'inactive' unchanged when status=inactive", () => {
    const session = makeSession("inactive", 5);
    expect(getEffectiveStatus(session)).toBe("inactive");
  });
});

// ─── shouldShowSession ────────────────────────────────────────────────────────

describe("shouldShowSession", () => {
  test("hides inactive session with all fields empty (ghost session)", () => {
    const ghost = makeSession("inactive", 60);
    expect(shouldShowSession(ghost)).toBe(false);
  });

  test("shows inactive session that has at least one field filled", () => {
    const session = { ...makeSession("inactive", 60), formData: { ...EMPTY_FORM_DATA, firstName: "Sarah" } };
    expect(shouldShowSession(session)).toBe(true);
  });

  test("shows filling session even with all fields empty (patient just opened form)", () => {
    const fresh = makeSession("filling", 5);
    expect(shouldShowSession(fresh)).toBe(true);
  });

  test("shows submitted session with all fields empty", () => {
    const submitted = makeSession("submitted", 60);
    expect(shouldShowSession(submitted)).toBe(true);
  });

  test("hides filling session that timed out with no data (effective status = inactive)", () => {
    // status=filling but lastActivityAt > 30s → getEffectiveStatus returns inactive
    const ghost = makeSession("filling", 60);
    expect(shouldShowSession(ghost)).toBe(false);
  });
});

// ─── formatRelativeTime ───────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  test("returns 'just now' for < 5 seconds", () => {
    const ts = new Date(Date.now() - 2_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("just now");
  });

  test("returns seconds format for 5-59 seconds", () => {
    const ts = new Date(Date.now() - 20_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("20s ago");
  });

  test("returns minutes format for 60+ seconds", () => {
    const ts = new Date(Date.now() - 90_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("1m ago");
  });

  test("returns hours format for 60+ minutes", () => {
    const ts = new Date(Date.now() - 3_600_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("1h ago");
  });
});
