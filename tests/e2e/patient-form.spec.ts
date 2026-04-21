import { test, expect } from "@playwright/test";
import { fillRequiredFields } from "./helpers/fill-form";

test.describe("Patient Form — Happy Path", () => {
  test("form loads without crashing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Patient Registration" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("submit button is disabled when form is empty", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Submit Registration" })).toBeDisabled({
      timeout: 10_000,
    });
  });

  test("submit button enables once all required fields are filled", async ({ page }) => {
    await page.goto("/");
    await fillRequiredFields(page);
    await expect(page.getByRole("button", { name: "Submit Registration" })).toBeEnabled({
      timeout: 5_000,
    });
  });

  test("shows success screen after submit", async ({ page }) => {
    await page.goto("/");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Submit Registration" }).click();
    await expect(page.getByText(/registered|success|submitted/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Patient Form — Session Persistence", () => {
  test("form data survives a page reload", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("First Name").fill("James");

    // Wait for debounce to flush to Firebase (300ms debounce + network)
    await page.waitForTimeout(1_000);
    await page.reload();

    await expect(page.getByLabel("First Name")).toHaveValue("James", {
      timeout: 10_000,
    });
  });

  test("success screen persists after reload — no re-submit allowed", async ({ page }) => {
    await page.goto("/");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Submit Registration" }).click();
    await page.waitForTimeout(1_000);
    await page.reload();

    await expect(page.getByText(/registered|success|submitted/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
