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

describe("Effective Status", () => {
  test("`filling` + last activity > 30s ago", () => {
    const session = makeSession("filling", 35);
    expect(getEffectiveStatus(session)).toBe("inactive");
  });

  test("`filling` + last activity < 30s ago", () => {
    const session = makeSession("filling", 10);
    expect(getEffectiveStatus(session)).toBe("filling");
  });

  test("`filling` + last activity at 29s (edge case)", () => {
    const session = makeSession("filling", 29);
    expect(getEffectiveStatus(session)).toBe("filling");
  });

  test("`submitted` + any last activity", () => {
    const session = makeSession("submitted", 60);
    expect(getEffectiveStatus(session)).toBe("submitted");
  });

  test("`inactive` + recent last activity", () => {
    const session = makeSession("inactive", 5);
    expect(getEffectiveStatus(session)).toBe("inactive");
  });
});

// ─── shouldShowSession ────────────────────────────────────────────────────────

describe("Show Session?", () => {
  test("`inactive` + all fields empty", () => {
    const ghost = makeSession("inactive", 60);
    expect(shouldShowSession(ghost)).toBe(false);
  });

  test("`inactive` + at least one field filled", () => {
    const session = { ...makeSession("inactive", 60), formData: { ...EMPTY_FORM_DATA, firstName: "Sarah" } };
    expect(shouldShowSession(session)).toBe(true);
  });

  test("`filling` + all fields empty", () => {
    const fresh = makeSession("filling", 5);
    expect(shouldShowSession(fresh)).toBe(true);
  });

  test("`submitted` + all fields empty", () => {
    const submitted = makeSession("submitted", 60);
    expect(shouldShowSession(submitted)).toBe(true);
  });

  test("`filling` + timed out + all fields empty", () => {
    // status=filling but lastActivityAt > 30s → getEffectiveStatus returns inactive
    const ghost = makeSession("filling", 60);
    expect(shouldShowSession(ghost)).toBe(false);
  });
});

// ─── formatRelativeTime ───────────────────────────────────────────────────────

describe("Relative Time", () => {
  test("< 5 seconds ago", () => {
    const ts = new Date(Date.now() - 2_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("just now");
  });

  test("5-59 seconds ago", () => {
    const ts = new Date(Date.now() - 20_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("20s ago");
  });

  test("60+ seconds ago", () => {
    const ts = new Date(Date.now() - 90_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("1m ago");
  });

  test("60+ minutes ago", () => {
    const ts = new Date(Date.now() - 3_600_000).toISOString();
    expect(formatRelativeTime(ts)).toBe("1h ago");
  });
});
