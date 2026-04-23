import { test, expect } from "@playwright/test";

// ─── ARIA Snapshot — Form Structure ──────────────────────────────────────────
//
// Guards the patient form's accessibility tree against unintended structural
// changes: field renames, required→optional drift, section reordering, or new
// fields added without updating the spec.
//
// If this test fails after a intentional change, run:
//   bunx playwright test form-structure --update-snapshots

test.describe("Form Structure — ARIA Snapshot", () => {
  test("patient form fields match accessibility spec", async ({ page }) => {
    await page.goto("/");
    // Wait for Firebase init — form only renders after session is created
    await page.getByLabel("First Name").waitFor({ timeout: 10_000 });

    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - region "Personal Information":
        - heading "Personal Information" [level=2]
        - textbox "First Name"
        - textbox "Middle Name"
        - textbox "Last Name"
        - textbox "Date of Birth"
        - combobox "Gender"
      - region "Contact Information":
        - heading "Contact Information" [level=2]
        - textbox "Phone Number"
        - textbox "Email"
        - textbox "Address"
      - region "Additional Information":
        - heading "Additional Information" [level=2]
        - combobox "Preferred Language"
        - textbox "Nationality"
        - textbox "Religion"
        - button /Emergency Contact/
      - button "Submit Registration" [disabled]
    `);
  });
});
