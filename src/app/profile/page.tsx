"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  MapPin,
  Sprout,
  Languages,
  Phone,
  ShieldCheck,
} from "lucide-react";

type Profile = {
  username?: string;
  email?: string;
  role?: "farmer" | "admin";
  isVerified?: boolean;
  state?: string;
  district?: string;
  village?: string;
  primaryCrops?: string[];
  farmSizeAcres?: number;
  preferredLanguage?: string;
  phone?: string;
  lat?: number;
  lon?: number;
  profileCompleted?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users/profile", { credentials: "include" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load profile");
        return data.data as Profile;
      })
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        if (!u.profileCompleted) router.push("/complete-profile");
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Error"));
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <p className="text-red-700">{error}</p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  const cropList = user.primaryCrops?.filter(Boolean) ?? [];

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
              Your account
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 mb-1">
              {user.username}
            </h1>
            <p className="text-stone-600 text-sm">{user.email}</p>
          </div>
          <Link
            href="/complete-profile"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <Section title="Where you farm" icon={<MapPin className="w-4 h-4" />}>
            <Row label="State" value={user.state || "—"} />
            <Row label="District" value={user.district || "—"} />
            <Row label="Village" value={user.village || "—"} />
            <Row
              label="Coordinates"
              value={
                user.lat && user.lon
                  ? `${user.lat.toFixed(3)}, ${user.lon.toFixed(3)}`
                  : "Not shared"
              }
            />
          </Section>

          <Divider />

          <Section title="Crops" icon={<Sprout className="w-4 h-4" />}>
            {cropList.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {cropList.map((c) => (
                  <span
                    key={c}
                    className="bg-green-50 text-green-800 border border-green-200 text-sm px-3 py-1 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-sm">None added yet.</p>
            )}
            <Row
              label="Farm size"
              value={user.farmSizeAcres ? `${user.farmSizeAcres} acres` : "—"}
            />
          </Section>

          <Divider />

          <Section title="Account" icon={<ShieldCheck className="w-4 h-4" />}>
            <Row label="Role" value={user.role === "admin" ? "Admin" : "Farmer"} />
            <Row
              label="Email verified"
              value={user.isVerified ? "Yes" : "Not yet"}
              tone={user.isVerified ? "good" : "warn"}
            />
            <Row
              label="Phone"
              value={user.phone || "—"}
              icon={<Phone className="w-3.5 h-3.5 text-stone-400" />}
            />
            <Row
              label="Language"
              value={user.preferredLanguage?.toUpperCase() || "EN"}
              icon={<Languages className="w-3.5 h-3.5 text-stone-400" />}
            />
          </Section>
        </div>

        <p className="text-xs text-stone-500 text-center mt-6">
          Your data stays on AgriBloom. We only use it to personalize prices, weather, and chat
          replies.
        </p>
      </div>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
        {icon}
        {title}
      </h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "good" | "warn";
}) {
  const valueClass =
    tone === "good"
      ? "text-green-700 font-medium"
      : tone === "warn"
        ? "text-amber-700 font-medium"
        : "text-stone-900 font-medium";
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-stone-500 inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-stone-100" />;
}
