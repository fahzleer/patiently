import { test, expect } from "@playwright/test";

test.describe("Blur Behaviour", () => {
  test("still typing (no blur yet)", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("First Name").focus();

    // Scope to the form so we don't catch Next.js's __next-route-announcer__
    // <div role="alert"> that sits at the document root.
    await expect(page.locator("form [role='alert']")).toHaveCount(0);
  });

  test("blur an empty required field", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("First Name").focus();
    await page.getByLabel("First Name").blur();

    await expect(page.locator("form [role='alert']").first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test("fill the field correctly after error", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("First Name").focus();
    await page.getByLabel("First Name").blur();
    await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 3_000 });

    await page.getByLabel("First Name").fill("Sarah");
    await page.getByLabel("Last Name").focus(); // blur First Name
    await expect(page.getByText("First name is required")).not.toBeVisible();
  });

  test("invalid email, then blur", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Email").blur();

    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 3_000 });
  });
});

test.describe("Emergency Contact", () => {
  test("name filled, relationship missing", async ({ page }) => {
    await page.goto("/");

    // Open the optional emergency contact section
    await page.getByRole("button", { name: /emergency contact/i }).click();
    await page.getByLabel("Contact Name").fill("Mum");
    await page.getByLabel("Contact Name").blur();

    await expect(
      page.getByText(/please enter the relationship/i)
    ).toBeVisible({ timeout: 3_000 });
  });

  test("both fields filled", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /emergency contact/i }).click();

    await page.getByLabel("Contact Name").fill("Mum");
    await page.getByLabel("Relationship").fill("Mother");
    await page.getByLabel("Relationship").blur();

    await expect(page.getByText(/please enter the relationship/i)).not.toBeVisible();
  });
});
