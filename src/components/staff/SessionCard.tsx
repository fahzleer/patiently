import type { PatientSession } from "@/types/PatientSession";
import { FIELD_LABELS } from "@/types/PatientSession";
import StatusIndicator from "./StatusIndicator";
import { getEffectiveStatus, formatRelativeTime } from "@/hooks/useStaffView";

interface Props {
  session: PatientSession;
}

// Fields to display in preview (in order)
const PREVIEW_FIELDS: (keyof typeof FIELD_LABELS)[] = [
  "firstName",
  "middleName",
  "lastName",
  "dateOfBirth",
  "gender",
  "phone",
  "email",
  "address",
  "preferredLanguage",
  "nationality",
  "religion",
  "emergencyName",
  "emergencyRelationship",
];

const GENDER_DISPLAY: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export default function SessionCard({ session }: Props) {
  const effectiveStatus = getEffectiveStatus(session);
  const { formData } = session;

  const patientName =
    [formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
    "Anonymous";

  const filledFields = PREVIEW_FIELDS.filter((field) => {
    const value = formData[field];
    return value && value.trim().length > 0;
  });

  return (
    <article
      className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
      aria-label={`Patient session: ${patientName}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate">
            {patientName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatRelativeTime(session.lastActivityAt)}
          </p>
        </div>
        <StatusIndicator status={effectiveStatus} />
      </div>

      {/* Filled fields preview */}
      {filledFields.length > 0 ? (
        <dl className="flex flex-col gap-1.5 text-xs border-t border-slate-100 pt-3">
          {filledFields.map((field) => {
            let value = formData[field];
            if (field === "gender") value = GENDER_DISPLAY[value] ?? value;
            return (
              <div key={field} className="flex gap-2 items-start">
                <dt className="text-slate-400 shrink-0 w-28">
                  {FIELD_LABELS[field]}
                </dt>
                <dd className="text-slate-700 font-medium wrap-break-word min-w-0">
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="text-xs text-slate-400 border-t border-slate-100 pt-3 italic">
          No fields filled yet
        </p>
      )}

      {/* Progress indicator */}
      <div className="text-xs text-slate-400 flex items-center gap-1">
        <span className="font-medium text-slate-600">{filledFields.length}</span>
        <span>/ {PREVIEW_FIELDS.length} fields filled</span>
      </div>
    </article>
  );
}
