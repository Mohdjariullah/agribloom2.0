"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-green-100 p-8 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We hit an unexpected error. You can try again or head back home.
        </p>
        {error?.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            ref: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Try again
          </button>
          <a
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
