"use client";
import MandiPricesComponent from "@/components/MandiPricesComponent";
import Footer from "@/components/Footer";
import { T } from "@/components/T";

// This route is already protected by middleware (src/middleware.ts).
// We do NOT re-check auth client-side here — a fragile /api/users/me check
// used to bounce users to /login on any transient mobile network blip.
export default function MandiPricesPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
            <T>Mandi prices</T>
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-2xl">
            <T>
              Today&apos;s wholesale rates from the government AGMARKNET feed. Pick a commodity and
              state to see prices and the 7-day trend.
            </T>
          </p>
        </header>

        <MandiPricesComponent />

        <p className="text-xs text-stone-500 mt-6 text-center">
          <T>Source: data.gov.in · AGMARKNET. Prices update daily.</T>
        </p>
      </div>
      <Footer />
    </main>
  );
}
