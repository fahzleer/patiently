import { test, expect } from "@playwright/test";
import { fillRequiredFields } from "./helpers/fill-form";

// These tests open two browser contexts simultaneously to simulate
// a patient and a staff member using the app at the same time.
// Firebase must be configured via .env.local for these to pass.

test.describe("Real-Time Sync", () => {
  test("patient types first name → staff sees it within 2 seconds", async ({ browser }) => {
    const patientCtx = await browser.newContext();
    const staffCtx = await browser.newContext();

    const patientPage = await patientCtx.newPage();
    const staffPage = await staffCtx.newPage();

    await staffPage.goto("/staff");
    await patientPage.goto("/");

    // Wait for form to be ready
    await patientPage.getByLabel("First Name").waitFor({ timeout: 10_000 });

    await patientPage.getByLabel("First Name").fill("RealTimeTest");

    // Staff view should show the name within 2s (300ms debounce + Firebase RTT).
    // Match the session-card heading specifically — the name also appears in the
    // field-preview <dd>, which would trip strict-mode.
    await expect(
      staffPage.getByRole("heading", { name: "RealTimeTest" }).first()
    ).toBeVisible({ timeout: 4_000 });

    await patientCtx.close();
    await staffCtx.close();
  });

  test("two patients open simultaneously → staff sees two cards", async ({ browser }) => {
    const patient1Ctx = await browser.newContext();
    const patient2Ctx = await browser.newContext();
    const staffCtx = await browser.newContext();

    const patient1 = await patient1Ctx.newPage();
    const patient2 = await patient2Ctx.newPage();
    const staffPage = await staffCtx.newPage();

    await staffPage.goto("/staff");
    await patient1.goto("/");
    await patient2.goto("/");

    await patient1.getByLabel("First Name").waitFor({ timeout: 10_000 });
    await patient2.getByLabel("First Name").waitFor({ timeout: 10_000 });

    await patient1.getByLabel("First Name").fill("AliceSync");
    await patient2.getByLabel("First Name").fill("BobSync");

    await expect(
      staffPage.getByRole("heading", { name: "AliceSync" }).first()
    ).toBeVisible({ timeout: 4_000 });
    await expect(
      staffPage.getByRole("heading", { name: "BobSync" }).first()
    ).toBeVisible({ timeout: 4_000 });

    await patient1Ctx.close();
    await patient2Ctx.close();
    await staffCtx.close();
  });

  test("patient submits → staff card changes to Submitted", async ({ browser }) => {
    const patientCtx = await browser.newContext();
    const staffCtx = await browser.newContext();

    const patientPage = await patientCtx.newPage();
    const staffPage = await staffCtx.newPage();

    await staffPage.goto("/staff");
    await patientPage.goto("/");

    await patientPage.getByLabel("First Name").waitFor({ timeout: 10_000 });
    await fillRequiredFields(patientPage);
    await patientPage.getByRole("button", { name: "Submit Registration" }).click();

    // Target the session-card status badge by its aria-label — plain
    // getByText("Submitted") collides with the "N submitted" summary pill.
    await expect(
      staffPage.getByLabel("Status: Submitted").first()
    ).toBeVisible({ timeout: 5_000 });

    await patientCtx.close();
    await staffCtx.close();
  });
});
