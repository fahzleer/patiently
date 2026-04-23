import { describe, expect, test } from "bun:test";
import {
  validateField,
  validateEmergencyContact,
  isFormValid,
} from "./validation";
import { EMPTY_FORM_DATA, REQUIRED_FIELDS } from "@/types/PatientSession";

// ─── validateField ───────────────────────────────────────────────────────────

describe("First Name", () => {
  test("any text", () => {
    expect(validateField("firstName", "John")).toBeNull();
  });
  test("empty string", () => {
    expect(validateField("firstName", "")).not.toBeNull();
  });
  test("whitespace only", () => {
    expect(validateField("firstName", "  ")).not.toBeNull();
  });
});

describe("Email", () => {
  test("valid format (`john@example.com`)", () => {
    expect(validateField("email", "john@example.com")).toBeNull();
  });
  test("missing `@`", () => {
    expect(validateField("email", "johnexample.com")).not.toBeNull();
  });
  test("empty string", () => {
    expect(validateField("email", "")).not.toBeNull();
  });
});

describe("Phone", () => {
  test("starts with `+66`", () => {
    expect(validateField("phone", "+66812345678")).toBeNull();
  });
  test("local format (`08x`)", () => {
    expect(validateField("phone", "0812345678")).toBeNull();
  });
  test("number with spaces", () => {
    expect(validateField("phone", "+66 81 234 5678")).toBeNull();
  });
  test("contains letters", () => {
    expect(validateField("phone", "abc")).not.toBeNull();
  });
  test("empty string", () => {
    expect(validateField("phone", "")).not.toBeNull();
  });
});

describe("Last Name", () => {
  test("any text", () => {
    expect(validateField("lastName", "Doe")).toBeNull();
  });
  test("empty string", () => {
    expect(validateField("lastName", "")).not.toBeNull();
  });
  test("whitespace only", () => {
    expect(validateField("lastName", "  ")).not.toBeNull();
  });
});

describe("Date of Birth", () => {
  test("valid date string", () => {
    expect(validateField("dateOfBirth", "1990-01-01")).toBeNull();
  });
  test("empty string", () => {
    expect(validateField("dateOfBirth", "")).not.toBeNull();
  });
  test("whitespace only", () => {
    expect(validateField("dateOfBirth", "  ")).not.toBeNull();
  });
});

describe("Address", () => {
  test("any non-empty text", () => {
    expect(validateField("address", "123 Main St, Bangkok")).toBeNull();
  });
  test("empty string", () => {
    expect(validateField("address", "")).not.toBeNull();
  });
  test("whitespace only", () => {
    expect(validateField("address", "  ")).not.toBeNull();
  });
});

describe("Preferred Language", () => {
  test("any non-empty text", () => {
    expect(validateField("preferredLanguage", "English")).toBeNull();
  });
  test("empty string", () => {
    expect(validateField("preferredLanguage", "")).not.toBeNull();
  });
  test("whitespace only", () => {
    expect(validateField("preferredLanguage", "  ")).not.toBeNull();
  });
});

describe("Nationality", () => {
  test("any non-empty text", () => {
    expect(validateField("nationality", "Thai")).toBeNull();
  });
  test("empty string", () => {
    expect(validateField("nationality", "")).not.toBeNull();
  });
  test("whitespace only", () => {
    expect(validateField("nationality", "  ")).not.toBeNull();
  });
});

describe("Middle Name (optional)", () => {
  test("left blank", () => {
    expect(validateField("middleName", "")).toBeNull();
  });
  test("filled in", () => {
    expect(validateField("middleName", "James")).toBeNull();
  });
});

describe("Religion (optional)", () => {
  test("left blank", () => {
    expect(validateField("religion", "")).toBeNull();
  });
  test("filled in", () => {
    expect(validateField("religion", "Buddhism")).toBeNull();
  });
});

describe("Gender", () => {
  test("`male`", () => {
    expect(validateField("gender", "male")).toBeNull();
  });
  test("`prefer_not_to_say`", () => {
    expect(validateField("gender", "prefer_not_to_say")).toBeNull();
  });
  test("value outside allowed list", () => {
    expect(validateField("gender", "unknown")).not.toBeNull();
  });
});

// ─── validateEmergencyContact ────────────────────────────────────────────────

describe("Emergency Contact", () => {
  test("both blank", () => {
    expect(validateEmergencyContact("", "")).toBeNull();
  });
  test("both filled", () => {
    expect(validateEmergencyContact("Jane", "Spouse")).toBeNull();
  });
  test("name filled, relationship missing", () => {
    const result = validateEmergencyContact("Jane", "");
    expect(result?.relationship).toBeDefined();
  });
  test("relationship filled, name missing", () => {
    const result = validateEmergencyContact("", "Spouse");
    expect(result?.name).toBeDefined();
  });
});

// ─── REQUIRED_FIELDS regression ──────────────────────────────────────────────
//
// If someone adds a field and forgets to include it in REQUIRED_FIELDS,
// or accidentally removes one, this test fails before it ships.

describe("Required Fields Guard", () => {
  test("count of required fields", () => {
    expect(REQUIRED_FIELDS).toHaveLength(9);
  });

  test("all expected fields present", () => {
    const expected = [
      "firstName", "lastName", "dateOfBirth", "gender",
      "phone", "email", "address", "preferredLanguage", "nationality",
    ];
    expect(REQUIRED_FIELDS).toEqual(expect.arrayContaining(expected));
  });

  test("no optional fields in required list", () => {
    expect(REQUIRED_FIELDS).not.toContain("middleName");
    expect(REQUIRED_FIELDS).not.toContain("religion");
    expect(REQUIRED_FIELDS).not.toContain("emergencyName");
    expect(REQUIRED_FIELDS).not.toContain("emergencyRelationship");
  });
});

// ─── isFormValid ─────────────────────────────────────────────────────────────

describe("Form Valid?", () => {
  test("fully empty form", () => {
    expect(isFormValid(EMPTY_FORM_DATA)).toBe(false);
  });

  test("all required fields valid", () => {
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

  test("one required field missing", () => {
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
