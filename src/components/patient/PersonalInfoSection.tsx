import FormField from "@/components/ui/FormField";
import type { PatientFormData } from "@/types/PatientSession";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

interface Props {
  formData: PatientFormData;
  errors: Partial<Record<keyof PatientFormData, string>>;
  onChange: (field: keyof PatientFormData, value: string) => void;
  onBlur: (field: keyof PatientFormData) => void;
  disabled?: boolean;
}

export default function PersonalInfoSection({
  formData,
  errors,
  onChange,
  onBlur,
  disabled,
}: Props) {
  return (
    <section aria-labelledby="personal-info-heading">
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h2
          id="personal-info-heading"
          className="text-base font-semibold text-slate-800"
        >
          Personal Information
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Fields marked with{" "}
          <span className="text-red-500 font-medium">*</span> are required
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          required
          value={formData.firstName}
          error={errors.firstName}
          placeholder="John"
          disabled={disabled}
          onChange={(e) => onChange("firstName", e.target.value)}
          onBlur={() => onBlur("firstName")}
        />

        <FormField
          label="Middle Name"
          value={formData.middleName}
          error={errors.middleName}
          placeholder="(optional)"
          disabled={disabled}
          onChange={(e) => onChange("middleName", e.target.value)}
          onBlur={() => onBlur("middleName")}
        />

        <FormField
          label="Last Name"
          required
          value={formData.lastName}
          error={errors.lastName}
          placeholder="Doe"
          disabled={disabled}
          onChange={(e) => onChange("lastName", e.target.value)}
          onBlur={() => onBlur("lastName")}
        />

        <FormField
          label="Date of Birth"
          required
          as="input"
          type="date"
          value={formData.dateOfBirth}
          error={errors.dateOfBirth}
          disabled={disabled}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          onBlur={() => onBlur("dateOfBirth")}
        />

        <div className="md:col-span-2">
          <FormField
            label="Gender"
            required
            as="select"
            value={formData.gender}
            error={errors.gender}
            disabled={disabled}
            options={GENDER_OPTIONS}
            onChange={(e) => onChange("gender", e.target.value)}
            onBlur={() => onBlur("gender")}
          />
        </div>
      </div>
    </section>
  );
}
