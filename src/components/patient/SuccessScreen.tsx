export default function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Form Submitted Successfully
      </h1>
      <p className="text-slate-500 max-w-sm">
        Thank you for providing your information. Our staff has been notified
        and will attend to you shortly.
      </p>
    </div>
  );
}
