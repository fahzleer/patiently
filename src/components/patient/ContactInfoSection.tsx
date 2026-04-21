import FormField from "@/components/ui/FormField";
import type { PatientFormData } from "@/types/PatientSession";

interface Props {
  formData: PatientFormData;
  errors: Partial<Record<keyof PatientFormData, string>>;
  onChange: (field: keyof PatientFormData, value: string) => void;
  onBlur: (field: keyof PatientFormData) => void;
  disabled?: boolean;
}

export default function ContactInfoSection({
  formData,
  errors,
  onChange,
  onBlur,
  disabled,
}: Props) {
  return (
    <section aria-labelledby="contact-info-heading">
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h2
          id="contact-info-heading"
          className="text-base font-semibold text-slate-800"
        >
          Contact Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Phone Number"
          required
          type="tel"
          value={formData.phone}
          error={errors.phone}
          placeholder="+66 81 234 5678"
          disabled={disabled}
          onChange={(e) => onChange("phone", e.target.value)}
          onBlur={() => onBlur("phone")}
        />

        <FormField
          label="Email"
          required
          type="email"
          value={formData.email}
          error={errors.email}
          placeholder="john@example.com"
          disabled={disabled}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => onBlur("email")}
        />

        <div className="md:col-span-2">
          <FormField
            label="Address"
            required
            as="textarea"
            value={formData.address}
            error={errors.address}
            placeholder="123 Main St, Bangkok, Thailand 10100"
            disabled={disabled}
            onChange={(e) => onChange("address", e.target.value)}
            onBlur={() => onBlur("address")}
          />
        </div>
      </div>
    </section>
  );
}
