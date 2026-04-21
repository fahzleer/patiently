import type { Page } from "@playwright/test";

/** Fills all 9 required fields with valid test data. */
export async function fillRequiredFields(page: Page) {
  await page.getByLabel("First Name").fill("Sarah");
  await page.getByLabel("Last Name").fill("Connor");
  await page.getByLabel("Date of Birth").fill("1990-05-15");
  await page.getByLabel("Phone Number").fill("+66812345678");
  await page.getByLabel("Email").fill("sarah@example.com");
  await page.getByLabel("Address").fill("123 Test Street, Bangkok");
  await page.getByLabel("Nationality").fill("British");

  // CustomSelect fields — click to open, then pick option
  await page.getByRole("combobox", { name: "Gender" }).click();
  await page.getByRole("option", { name: "Female" }).click();

  await page.getByRole("combobox", { name: "Preferred Language" }).click();
  await page.getByRole("option", { name: "English" }).click();
}

/** Waits for the patient form to be fully loaded (not the loading spinner). */
export async function waitForForm(page: Page) {
  await page.waitForSelector('input[aria-label="First Name"], [aria-label="First Name"]', {
    timeout: 10_000,
  });
}
