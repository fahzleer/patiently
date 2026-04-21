import { type, ArkErrors } from "arktype";
import type { PatientFormData } from "@/types/PatientSession";

// Per-field schemas — validate one field at a time on blur
export const fieldSchemas = {
  firstName: type("string > 0"),
  middleName: type("string"),
  lastName: type("string > 0"),
  dateOfBirth: type("string > 0"),
  gender: type(
    "'male' | 'female' | 'other' | 'prefer_not_to_say'"
  ),
  phone: type(/^\+?[0-9\s\-()\u200b]{7,15}$/),
  email: type("string.email"),
  address: type("string > 0"),
  preferredLanguage: type("string > 0"),
  nationality: type("string > 0"),
  religion: type("string"),
} satisfies Partial<Record<keyof PatientFormData, ReturnType<typeof type>>>;

export type ValidatableField = keyof typeof fieldSchemas;

/**
 * Validate a single field value.
 * Returns an error message string, or null if valid.
 */
export function validateField(
  field: ValidatableField,
  value: unknown
): string | null {
  // Trim strings before validation to reject whitespace-only input
  const normalized =
    typeof value === "string" ? value.trim() : value;

  const schema = fieldSchemas[field];
  const result = schema(normalized);
  if (result instanceof ArkErrors) {
    return getFriendlyError(field, result.summary);
  }
  return null;
}

/**
 * Emergency contact group validation.
 * Must fill both or neither.
 */
export function validateEmergencyContact(
  name: string,
  relationship: string
): { name?: string; relationship?: string } | null {
  const hasName = name.trim().length > 0;
  const hasRelationship = relationship.trim().length > 0;

  if (hasName && !hasRelationship) {
    return { relationship: "Please enter the relationship" };
  }
  if (!hasName && hasRelationship) {
    return { name: "Please enter the contact name" };
  }
  return null;
}

/**
 * Check if all required fields in formData are valid.
 */
export function isFormValid(formData: PatientFormData): boolean {
  const requiredFields: ValidatableField[] = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "phone",
    "email",
    "address",
    "preferredLanguage",
    "nationality",
  ];

  return requiredFields.every((field) => {
    const value = formData[field];
    return validateField(field, value) === null;
  });
}

// Human-friendly error messages
function getFriendlyError(field: ValidatableField, summary: string): string {
  const messages: Partial<Record<ValidatableField, string>> = {
    firstName: "First name is required",
    lastName: "Last name is required",
    dateOfBirth: "Date of birth is required",
    gender: "Please select a gender",
    phone: "Enter a valid phone number (7-15 digits)",
    email: "Enter a valid email address",
    address: "Address is required",
    preferredLanguage: "Please select a preferred language",
    nationality: "Nationality is required",
  };
  return messages[field] ?? summary;
}
