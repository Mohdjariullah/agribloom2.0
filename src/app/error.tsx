"use client";

import Link from "next/link";
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
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
          Error
        </p>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Something went wrong.
        </h1>
        <p className="text-stone-600 mb-6 text-sm">
          We hit an unexpected error. You can try again or head back home.
        </p>
        {error?.digest && (
          <p className="text-xs text-stone-400 mb-4 font-mono">
            ref: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-stone-100 hover:bg-stone-200 text-stone-900 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
