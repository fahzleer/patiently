import type { PatientSessionStatus } from "./PatientSessionStatus";

export interface PatientFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  religion: string;
  emergencyName: string;
  emergencyRelationship: string;
}

export interface PatientSession {
  id: string;
  status: PatientSessionStatus;
  createdAt: string;
  lastActivityAt: string;
  formData: PatientFormData;
}

export const EMPTY_FORM_DATA: PatientFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
  religion: "",
  emergencyName: "",
  emergencyRelationship: "",
};

export const FIELD_LABELS: Record<keyof PatientFormData, string> = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  phone: "Phone Number",
  email: "Email",
  address: "Address",
  preferredLanguage: "Preferred Language",
  nationality: "Nationality",
  religion: "Religion",
  emergencyName: "Emergency Contact Name",
  emergencyRelationship: "Emergency Relationship",
};

export const REQUIRED_FIELDS: (keyof PatientFormData)[] = [
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
