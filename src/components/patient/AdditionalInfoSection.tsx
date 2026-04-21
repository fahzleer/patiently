"use client";

import FormField from "@/components/ui/FormField";
import type { PatientFormData } from "@/types/PatientSession";

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Thai", label: "Thai" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Spanish", label: "Spanish" },
  { value: "Other", label: "Other" },
];

interface Props {
  formData: PatientFormData;
  errors: Partial<Record<keyof PatientFormData, string>>;
  onChange: (field: keyof PatientFormData, value: string) => void;
  onBlur: (field: keyof PatientFormData) => void;
  emergencyOpen: boolean;
  setEmergencyOpen: (open: boolean) => void;
  disabled?: boolean;
}

export default function AdditionalInfoSection({
  formData,
  errors,
  onChange,
  onBlur,
  emergencyOpen,
  setEmergencyOpen,
  disabled,
}: Props) {
  return (
    <section aria-labelledby="additional-info-heading">
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h2
          id="additional-info-heading"
          className="text-base font-semibold text-slate-800"
        >
          Additional Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Preferred Language"
          required
          as="select"
          value={formData.preferredLanguage}
          error={errors.preferredLanguage}
          options={LANGUAGE_OPTIONS}
          disabled={disabled}
          onChange={(e) => onChange("preferredLanguage", e.target.value)}
          onBlur={() => onBlur("preferredLanguage")}
        />

        <FormField
          label="Nationality"
          required
          value={formData.nationality}
          error={errors.nationality}
          placeholder="e.g. Thai"
          disabled={disabled}
          onChange={(e) => onChange("nationality", e.target.value)}
          onBlur={() => onBlur("nationality")}
        />

        <div className="md:col-span-2">
          <FormField
            label="Religion"
            value={formData.religion}
            error={errors.religion}
            placeholder="(optional)"
            disabled={disabled}
            onChange={(e) => onChange("religion", e.target.value)}
            onBlur={() => onBlur("religion")}
          />
        </div>
      </div>

      {/* Emergency Contact Toggle */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setEmergencyOpen(!emergencyOpen)}
          aria-expanded={emergencyOpen}
          aria-controls="emergency-contact-section"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${emergencyOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {emergencyOpen ? "Hide" : "Add"} Emergency Contact{" "}
          <span className="text-slate-400 font-normal">(optional)</span>
        </button>

        {emergencyOpen && (
          <div
            id="emergency-contact-section"
            className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormField
              label="Contact Name"
              value={formData.emergencyName}
              error={errors.emergencyName}
              placeholder="Jane Doe"
              disabled={disabled}
              onChange={(e) => onChange("emergencyName", e.target.value)}
              onBlur={() => onBlur("emergencyName")}
            />
            <FormField
              label="Relationship"
              value={formData.emergencyRelationship}
              error={errors.emergencyRelationship}
              placeholder="e.g. Spouse, Parent"
              disabled={disabled}
              onChange={(e) =>
                onChange("emergencyRelationship", e.target.value)
              }
              onBlur={() => onBlur("emergencyRelationship")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
