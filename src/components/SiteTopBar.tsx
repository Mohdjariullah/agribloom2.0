"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TopUtilityStrip } from "@/components/landing/TopUtilityStrip";

// The government-style top strip (tricolour hairline + helpline + language)
// sits above the brand navbar on every page EXCEPT the auth/onboarding
// screens, which have their own focused chrome.
const HIDE_ON = ["/login", "/signup", "/verifyemail", "/complete-profile", "/edit-profile"];

export default function SiteTopBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (HIDE_ON.includes(pathname)) return null;

  return <TopUtilityStrip />;
}
