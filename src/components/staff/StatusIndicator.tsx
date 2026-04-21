import type { PatientSessionStatus } from "@/types/PatientSessionStatus";

interface Props {
  status: PatientSessionStatus;
}

const CONFIG: Record<
  PatientSessionStatus,
  { dot: string; text: string; label: string }
> = {
  filling: {
    dot: "bg-green-500 animate-pulse",
    text: "text-green-700 bg-green-50",
    label: "Live",
  },
  submitted: {
    dot: "bg-blue-400",
    text: "text-blue-700 bg-blue-50",
    label: "Submitted",
  },
  inactive: {
    dot: "bg-slate-400",
    text: "text-slate-600 bg-slate-100",
    label: "Timed out",
  },
};

export default function StatusIndicator({ status }: Props) {
  const { dot, text, label } = CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${text}`}
      aria-label={`Status: ${label}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
