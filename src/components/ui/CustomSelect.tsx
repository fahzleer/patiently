"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  id?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export default function CustomSelect({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select...",
  disabled,
  error,
  ...ariaProps
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onBlur]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    } else if (e.key === "Escape") {
      setOpen(false);
      onBlur?.();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const next = options[idx + 1];
      if (next) onChange(next.value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const prev = options[idx - 1];
      if (prev) onChange(prev.value);
    }
  }

  const triggerClass = [
    "w-full rounded-lg border px-3 py-2.5 text-sm text-left",
    "bg-white transition-colors duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-0",
    "flex items-center justify-between gap-2 min-h-[44px]",
    disabled ? "bg-slate-100 cursor-not-allowed text-slate-400" : "cursor-pointer",
    error
      ? "border-red-400 focus:ring-red-400"
      : open
      ? "border-blue-500 ring-2 ring-blue-500"
      : "border-slate-300 hover:border-slate-400 focus:ring-blue-500",
    selected ? "text-slate-900" : "text-slate-400",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        className={triggerClass}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        onBlur={() => {
          if (!open) onBlur?.();
        }}
        onKeyDown={handleKeyDown}
        {...ariaProps}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M6 8l4 4 4-4"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-auto max-h-56 py-1"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={[
                "px-3 py-2 text-sm cursor-pointer select-none flex items-center justify-between",
                opt.value === value
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                onBlur?.();
              }}
            >
              {opt.label}
              {opt.value === value && (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
