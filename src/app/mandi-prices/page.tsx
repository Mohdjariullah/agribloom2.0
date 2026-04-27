"use client";
import MandiPricesComponent from "@/components/MandiPricesComponent";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import axios from "axios";

export default function MandiPricesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/users/me")
      .then((res) => {
        if (cancelled) return;
        if (!res.data.authenticated) {
          router.push("/login?redirect=/mandi-prices");
          return;
        }
        setAuthed(true);
      })
      .catch(() => router.push("/login?redirect=/mandi-prices"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center text-stone-600">
          <div className="animate-pulse text-base">{t("common.loading")}…</div>
        </div>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
            Mandi prices
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-2xl">
            Today&apos;s wholesale rates from the government AGMARKNET feed. Pick a commodity and
            state to see prices and the 7-day trend.
          </p>
        </header>

        <MandiPricesComponent />

        <p className="text-xs text-stone-500 mt-6 text-center">
          Source: data.gov.in · AGMARKNET. Prices update daily.
        </p>
      </div>
      <Footer />
    </main>
  );
}
