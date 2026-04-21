import { describe, expect, test } from "bun:test";
import { SESSION_ID_KEY } from "./session";

// ─── SESSION_ID_KEY stability ─────────────────────────────────────────────────
//
// Regression guard: if this key ever changes, every active user loses their
// in-progress session silently. This test must fail loudly before that happens.

describe("SESSION_ID_KEY", () => {
  test("is exactly 'patiently_session_id'", () => {
    expect(SESSION_ID_KEY).toBe("patiently_session_id");
  });

  test("does not contain 'agnos' (old name)", () => {
    expect(SESSION_ID_KEY).not.toContain("agnos");
  });
});
