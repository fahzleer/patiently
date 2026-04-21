"use client";

export const dynamic = "force-dynamic";

import { usePatientForm } from "@/hooks/usePatientForm";
import PersonalInfoSection from "@/components/patient/PersonalInfoSection";
import ContactInfoSection from "@/components/patient/ContactInfoSection";
import AdditionalInfoSection from "@/components/patient/AdditionalInfoSection";
import SuccessScreen from "@/components/patient/SuccessScreen";

export default function PatientFormPage() {
  const {
    formData,
    errors,
    isValid,
    isSubmitted,
    isLoading,
    firebaseError,
    emergencyOpen,
    setEmergencyOpen,
    handleChange,
    handleBlur,
    handleSubmit,
  } = usePatientForm();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg
            className="w-5 h-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Loading your form...</span>
        </div>
      </main>
    );
  }

  if (firebaseError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-2">
            Database not configured
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Firebase credentials are missing. Please set up your{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>{" "}
            file.
          </p>
          <pre className="text-left text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 overflow-auto">
            {`cp .env.example .env.local\n# then fill in your Firebase credentials`}
          </pre>
        </div>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen">
        <SuccessScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Patient Registration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Please fill in your details below. Your information is saved
            automatically.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isValid) handleSubmit();
            }}
            noValidate
            className="flex flex-col gap-8"
          >
            <PersonalInfoSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <ContactInfoSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <AdditionalInfoSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
              emergencyOpen={emergencyOpen}
              setEmergencyOpen={setEmergencyOpen}
            />

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={!isValid}
                aria-disabled={!isValid}
                className="
                  w-full py-3 px-6 rounded-xl text-sm font-semibold
                  transition-all duration-150
                  bg-blue-600 text-white
                  hover:bg-blue-700 active:scale-[0.98]
                  disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  min-h-11
                "
              >
                Submit Registration
              </button>
              {!isValid && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  Please fill in all required fields to submit
                </p>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Your information is securely transmitted
        </p>
      </div>
    </main>
  );
}
