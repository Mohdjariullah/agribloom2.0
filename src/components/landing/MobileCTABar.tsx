"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { T } from "@/components/T";

/**
 * Sticky bottom action bar — mobile only, landing only.
 * Hidden once the user is logged in (they don't need a Sign-up CTA).
 * Bottom-safe via env(safe-area-inset-bottom).
 */
export function MobileCTABar() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/users/me", { withCredentials: true })
      .then((r) => {
        if (!cancelled) setAuthed(!!r.data?.authenticated);
      })
      .catch(() => !cancelled && setAuthed(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (authed === null || authed === true) return null;

  return (
    <div
      className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 gap-2 px-3 py-3">
        <Link
          href="/mandi-prices"
          className="flex items-center justify-center text-sm font-medium text-stone-900 border border-stone-300 rounded-full py-3 active:bg-stone-100 transition-colors"
        >
          <T>Mandi prices</T>
        </Link>
        <Link
          href="/signup"
          className="flex items-center justify-center text-sm font-semibold bg-green-700 hover:bg-green-800 text-white rounded-full py-3 transition-colors shadow-sm"
        >
          <T>Create account</T>
        </Link>
      </div>
    </div>
  );
}
