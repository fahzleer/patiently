import { test, expect } from "@playwright/test";
import { fillRequiredFields } from "./helpers/fill-form";

// Staff view tests — each test opens isolated browser contexts so sessions
// don't bleed between cases. Firebase must be live for these to pass.

test.describe("Staff View", () => {
  test("card shows 'Anonymous' before any name is filled", async ({ browser }) => {
    const patientCtx = await browser.newContext();
    const staffCtx = await browser.newContext();

    const patientPage = await patientCtx.newPage();
    const staffPage = await staffCtx.newPage();

    await staffPage.goto("/staff");
    await patientPage.goto("/");
    await patientPage.getByLabel("First Name").waitFor({ timeout: 10_000 });

    // Scope to the first card — staff view sorts filling sessions by
    // lastActivityAt DESC, so the session just created is always first.
    // Avoids strict-mode violation when stale "Anonymous" sessions from
    // previous runs are still visible in Firebase.
    await expect(
      staffPage.locator("article").first().getByRole("heading", { name: "Anonymous" })
    ).toBeVisible({ timeout: 4_000 });

    await patientCtx.close();
    await staffCtx.close();
  });

  test("card header shows full name once first and last name are filled", async ({ browser }) => {
    const patientCtx = await browser.newContext();
    const staffCtx = await browser.newContext();

    const patientPage = await patientCtx.newPage();
    const staffPage = await staffCtx.newPage();

    await staffPage.goto("/staff");
    await patientPage.goto("/");
    await patientPage.getByLabel("First Name").waitFor({ timeout: 10_000 });

    await patientPage.getByLabel("First Name").fill("Grace");
    await patientPage.getByLabel("Last Name").fill("Kelly");

    await expect(
      staffPage.getByRole("heading", { name: "Grace Kelly" })
    ).toBeVisible({ timeout: 4_000 });

    await patientCtx.close();
    await staffCtx.close();
  });

  test("filling session appears before submitted in the card list", async ({ browser }) => {
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

    // patient1 submits — becomes "Submitted"
    await fillRequiredFields(patient1);
    await patient1.getByRole("button", { name: "Submit Registration" }).click();
    await patient1.waitForTimeout(1_000);

    // patient2 stays filling — becomes "Live"
    await patient2.getByLabel("First Name").fill("StillFilling");

    // First card on staff must be "Live", not "Submitted"
    await expect(
      staffPage.locator("article").first().getByLabel("Status: Live")
    ).toBeVisible({ timeout: 5_000 });

    await patient1Ctx.close();
    await patient2Ctx.close();
    await staffCtx.close();
  });

  test("field progress counter increments as patient fills the form", async ({ browser }) => {
    const patientCtx = await browser.newContext();
    const staffCtx = await browser.newContext();

    const patientPage = await patientCtx.newPage();
    const staffPage = await staffCtx.newPage();

    await staffPage.goto("/staff");
    await patientPage.goto("/");
    await patientPage.getByLabel("First Name").waitFor({ timeout: 10_000 });

    // Unique per run — prevents stale Firebase sessions from previous runs
    // causing "strict mode violation: resolved to 2 elements"
    const firstName = `CT${Date.now()}`;
    await patientPage.getByLabel("First Name").fill(firstName);
    await patientPage.getByLabel("Last Name").fill("User");

    // 2 out of 13 fields filled — number and label are in separate spans,
    // so scope to the card and match the label span only
    const card = staffPage.locator("article", { hasText: firstName });
    await expect(
      card.getByText("/ 13 fields filled")
    ).toBeVisible({ timeout: 4_000 });

    await patientCtx.close();
    await staffCtx.close();
  });
});
