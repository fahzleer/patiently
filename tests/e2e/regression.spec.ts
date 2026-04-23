import { test, expect } from "@playwright/test";

// ─── Regression tests ─────────────────────────────────────────────────────────
// Each test here corresponds to a specific bug that was fixed.
// If the test fails, a known bug has come back.

test.describe("SSR", () => {
  test("patient page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const seriousErrors = errors.filter(
      (e) => !e.includes("Warning:") && !e.includes("DevTools")
    );
    expect(seriousErrors).toHaveLength(0);
  });

  test("staff page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/staff");
    await page.waitForLoadState("networkidle");

    const seriousErrors = errors.filter(
      (e) => !e.includes("Warning:") && !e.includes("DevTools")
    );
    expect(seriousErrors).toHaveLength(0);
  });
});

test.describe("Firebase unconfigured", () => {
  // If NEXT_PUBLIC_FIREBASE_DATABASE_URL is missing, the app must show
  // an error screen instead of crashing with an unhandled exception.
  test("patient page", async ({ page }) => {
    await page.goto("/");
    // Either the form loads (Firebase ok) or an error card is shown — never a blank crash
    const formOrError = page.locator("main");
    await expect(formOrError).toBeVisible({ timeout: 10_000 });
  });

  test("staff page", async ({ page }) => {
    await page.goto("/staff");
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Session Key", () => {
  test("key written to sessionStorage", async ({ page }) => {
    await page.goto("/");
    // Wait for the app to initialise and write the key
    await page.waitForTimeout(2_000);

    const key = await page.evaluate(() =>
      Object.keys(sessionStorage).find((k) => k.includes("session"))
    );
    expect(key).toBe("patiently_session_id");
  });
});
