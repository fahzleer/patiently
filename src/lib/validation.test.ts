import { describe, expect, test } from "bun:test";
import {
  validateField,
  validateEmergencyContact,
  isFormValid,
} from "./validation";
import { EMPTY_FORM_DATA, REQUIRED_FIELDS } from "@/types/PatientSession";

// ─── validateField ───────────────────────────────────────────────────────────

describe("validateField — firstName", () => {
  test("returns null for non-empty string", () => {
    expect(validateField("firstName", "John")).toBeNull();
  });
  test("returns error for empty string", () => {
    expect(validateField("firstName", "")).not.toBeNull();
  });
  test("returns error for whitespace-only", () => {
    expect(validateField("firstName", "  ")).not.toBeNull();
  });
});

describe("validateField — email", () => {
  test("returns null for valid email", () => {
    expect(validateField("email", "john@example.com")).toBeNull();
  });
  test("returns error for missing @", () => {
    expect(validateField("email", "johnexample.com")).not.toBeNull();
  });
  test("returns error for empty string", () => {
    expect(validateField("email", "")).not.toBeNull();
  });
});

describe("validateField — phone", () => {
  test("returns null for +66 format", () => {
    expect(validateField("phone", "+66812345678")).toBeNull();
  });
  test("returns null for local format", () => {
    expect(validateField("phone", "0812345678")).toBeNull();
  });
  test("returns null for formatted with spaces", () => {
    expect(validateField("phone", "+66 81 234 5678")).toBeNull();
  });
  test("returns error for letters", () => {
    expect(validateField("phone", "abc")).not.toBeNull();
  });
  test("returns error for empty string", () => {
    expect(validateField("phone", "")).not.toBeNull();
  });
});

describe("validateField — gender", () => {
  test("returns null for 'male'", () => {
    expect(validateField("gender", "male")).toBeNull();
  });
  test("returns null for 'prefer_not_to_say'", () => {
    expect(validateField("gender", "prefer_not_to_say")).toBeNull();
  });
  test("returns error for invalid value", () => {
    expect(validateField("gender", "unknown")).not.toBeNull();
  });
});

// ─── validateEmergencyContact ────────────────────────────────────────────────

describe("validateEmergencyContact", () => {
  test("returns null when both empty", () => {
    expect(validateEmergencyContact("", "")).toBeNull();
  });
  test("returns null when both filled", () => {
    expect(validateEmergencyContact("Jane", "Spouse")).toBeNull();
  });
  test("returns relationship error when only name filled", () => {
    const result = validateEmergencyContact("Jane", "");
    expect(result?.relationship).toBeDefined();
  });
  test("returns name error when only relationship filled", () => {
    const result = validateEmergencyContact("", "Spouse");
    expect(result?.name).toBeDefined();
  });
});

// ─── REQUIRED_FIELDS regression ──────────────────────────────────────────────
//
// If someone adds a field and forgets to include it in REQUIRED_FIELDS,
// or accidentally removes one, this test fails before it ships.

describe("REQUIRED_FIELDS", () => {
  test("contains exactly 9 fields", () => {
    expect(REQUIRED_FIELDS).toHaveLength(9);
  });

  test("includes all expected fields", () => {
    const expected = [
      "firstName", "lastName", "dateOfBirth", "gender",
      "phone", "email", "address", "preferredLanguage", "nationality",
    ];
    expect(REQUIRED_FIELDS).toEqual(expect.arrayContaining(expected));
  });

  test("does not include optional fields", () => {
    expect(REQUIRED_FIELDS).not.toContain("middleName");
    expect(REQUIRED_FIELDS).not.toContain("religion");
    expect(REQUIRED_FIELDS).not.toContain("emergencyName");
    expect(REQUIRED_FIELDS).not.toContain("emergencyRelationship");
  });
});

// ─── isFormValid ─────────────────────────────────────────────────────────────

describe("isFormValid", () => {
  test("returns false for empty form", () => {
    expect(isFormValid(EMPTY_FORM_DATA)).toBe(false);
  });

  test("returns true for fully valid form", () => {
    expect(
      isFormValid({
        ...EMPTY_FORM_DATA,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "male",
        phone: "+66812345678",
        email: "john@example.com",
        address: "123 Main St, Bangkok",
        preferredLanguage: "English",
        nationality: "Thai",
      })
    ).toBe(true);
  });

  test("returns false when one required field is missing", () => {
    expect(
      isFormValid({
        ...EMPTY_FORM_DATA,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "male",
        phone: "+66812345678",
        email: "", // missing
        address: "123 Main St",
        preferredLanguage: "English",
        nationality: "Thai",
      })
    ).toBe(false);
  });
});
