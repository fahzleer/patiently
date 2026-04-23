import { test, expect } from "@playwright/test";
import { fillRequiredFields } from "./helpers/fill-form";

test.describe("Happy Path", () => {
  test("open the form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Patient Registration" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("submit button on empty form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Submit Registration" })).toBeDisabled({
      timeout: 10_000,
    });
  });

  test("submit button after all required fields filled", async ({ page }) => {
    await page.goto("/");
    await fillRequiredFields(page);
    await expect(page.getByRole("button", { name: "Submit Registration" })).toBeEnabled({
      timeout: 5_000,
    });
  });

  test("click submit", async ({ page }) => {
    await page.goto("/");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Submit Registration" }).click();
    await expect(page.getByText(/registered|success|submitted/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Session Persistence", () => {
  test("fill a field, then reload the page", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("First Name").fill("James");

    // Wait for debounce to flush to Firebase (300ms debounce + network)
    await page.waitForTimeout(1_000);
    await page.reload();

    await expect(page.getByLabel("First Name")).toHaveValue("James", {
      timeout: 10_000,
    });
  });

  test("submit, then reload", async ({ page }) => {
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
