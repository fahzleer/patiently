"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getOrCreateSessionId,
  createSession,
  fetchSession,
  updateFormData,
  updateStatus,
  registerDisconnect,
  cancelDisconnect,
} from "@/lib/session";
import {
  validateField,
  validateEmergencyContact,
  isFormValid,
  type ValidatableField,
} from "@/lib/validation";
import { EMPTY_FORM_DATA } from "@/types/PatientSession";
import type { PatientFormData } from "@/types/PatientSession";

const INACTIVITY_TIMEOUT_MS = 30_000;
const DEBOUNCE_MS = 300;

type FormErrors = Partial<Record<keyof PatientFormData, string>>;

interface UsePatientFormReturn {
  sessionId: string;
  formData: PatientFormData;
  errors: FormErrors;
  isValid: boolean;
  isSubmitted: boolean;
  isLoading: boolean;
  firebaseError: string | null;
  emergencyOpen: boolean;
  setEmergencyOpen: (open: boolean) => void;
  handleChange: (field: keyof PatientFormData, value: string) => void;
  handleBlur: (field: keyof PatientFormData) => void;
  handleSubmit: () => Promise<void>;
}

export function usePatientForm(): UsePatientFormReturn {
  // Start as empty string — set in useEffect to avoid SSR/localStorage issues
  const [sessionId, setSessionId] = useState<string>("");
  const [formData, setFormData] = useState<PatientFormData>(EMPTY_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFormData = useRef<PatientFormData>(EMPTY_FORM_DATA);

  // ─── Init: resolve sessionId then load/create session ─────────────────────
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);

    async function init() {
      setIsLoading(true);
      try {
        const existing = await fetchSession(id);
        if (!existing) {
          // New session
          await createSession(id);
        } else if (existing.status === "submitted") {
          // Already submitted — show success screen
          setIsSubmitted(true);
        } else {
          // Resume filling or inactive session — reset to filling
          setFormData(existing.formData);
          latestFormData.current = existing.formData;
          await updateStatus(id, "filling");
        }

        // Register onDisconnect hook — if the WebSocket drops (browser close,
        // network loss, crash), Firebase server marks us inactive automatically.
        // Skip for submitted sessions: they must stay "submitted" permanently.
        if (existing?.status !== "submitted") {
          await registerDisconnect(id);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to connect to database";
        setFirebaseError(msg);
        console.error("Session init error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // ─── Inactivity Timer ───────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(async () => {
      await updateStatus(sessionId, "inactive");
    }, INACTIVITY_TIMEOUT_MS);
  }, [sessionId]);

  useEffect(() => {
    if (!isLoading && !isSubmitted) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    
  }, [isLoading, isSubmitted]);

  // ─── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  // ─── Debounced Firebase Write ───────────────────────────────────────────────
  const scheduleSave = useCallback(
    (data: PatientFormData) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        try {
          await updateFormData(sessionId, data);
        } catch (err) {
          console.error("Firebase write error:", err);
        }
      }, DEBOUNCE_MS);
    },
    [sessionId]
  );

  // ─── Field Change ───────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof PatientFormData, value: string) => {
      const updated = { ...latestFormData.current, [field]: value };
      latestFormData.current = updated;
      setFormData(updated);

      // Clear error on change (re-validate on blur)
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // Reset inactivity timer on every keystroke
      resetInactivityTimer();

      // Schedule debounced write
      scheduleSave(updated);
    },
    [errors, resetInactivityTimer, scheduleSave]
  );

  // ─── Field Blur Validation ──────────────────────────────────────────────────
  const handleBlur = useCallback((field: keyof PatientFormData) => {
    const value = latestFormData.current[field];

    if (field in { firstName: 1, lastName: 1, dateOfBirth: 1, gender: 1, phone: 1, email: 1, address: 1, preferredLanguage: 1, nationality: 1 }) {
      const error = validateField(field as ValidatableField, value);
      setErrors((prev) => ({ ...prev, [field]: error ?? undefined }));
    }

    // Emergency contact group validation
    if (field === "emergencyName" || field === "emergencyRelationship") {
      const { emergencyName, emergencyRelationship } = latestFormData.current;
      const ecErrors = validateEmergencyContact(emergencyName, emergencyRelationship);
      setErrors((prev) => ({
        ...prev,
        emergencyName: ecErrors?.name ?? undefined,
        emergencyRelationship: ecErrors?.relationship ?? undefined,
      }));
    }
  }, []);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      // Flush final data immediately
      await updateFormData(sessionId, latestFormData.current);
    }
    // Cancel the onDisconnect hook before writing the terminal status —
    // otherwise a reload/close will overwrite "submitted" with "inactive".
    await cancelDisconnect(sessionId);
    await updateStatus(sessionId, "submitted");
    setIsSubmitted(true);
  }, [sessionId]);

  return {
    sessionId,
    formData,
    errors,
    isValid: isFormValid(formData),
    isSubmitted,
    isLoading,
    firebaseError,
    emergencyOpen,
    setEmergencyOpen,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
