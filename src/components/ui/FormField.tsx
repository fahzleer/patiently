import React, { useId } from "react";
import CustomSelect from "./CustomSelect";

type BaseProps = {
  label: string;
  error?: string | null;
  required?: boolean;
  hint?: string;
};

type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextAreaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type SelectProps = BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    options: { value: string; label: string }[];
  };

type FormFieldProps = InputProps | TextAreaProps | SelectProps;

export default function FormField(props: FormFieldProps) {
  const uid = useId();
  const { label, error, required, hint, as = "input", ...rest } = props;

  const inputId = `field-${uid}`;
  const errorId = `error-${uid}`;
  const hintId = `hint-${uid}`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const sharedInputClass = `
    w-full rounded-lg border px-3 py-2.5 text-sm
    bg-white text-slate-900 placeholder-slate-400
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
    disabled:bg-slate-100 disabled:cursor-not-allowed
    min-h-[44px]
    ${error
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 hover:border-slate-400"
    }
  `.trim();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-slate-700 leading-none"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {as === "textarea" ? (
        <textarea
          id={inputId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${sharedInputClass} min-h-22 resize-y`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === "select" ? (
        <CustomSelect
          id={inputId}
          options={(props as SelectProps).options}
          value={((rest as React.SelectHTMLAttributes<HTMLSelectElement>).value as string) ?? ""}
          onChange={(val) => {
            const onChange = (rest as React.SelectHTMLAttributes<HTMLSelectElement>).onChange;
            if (onChange) {
              onChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
            }
          }}
          onBlur={(rest as React.SelectHTMLAttributes<HTMLSelectElement>).onBlur as () => void}
          disabled={(rest as React.SelectHTMLAttributes<HTMLSelectElement>).disabled}
          error={!!error}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          id={inputId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={sharedInputClass}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <svg
            className="w-3 h-3 shrink-0"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.5 2.5a.5.5 0 011 0V6a.5.5 0 01-1 0V3.5zm.5 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
