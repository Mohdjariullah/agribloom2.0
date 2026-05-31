"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MapPin, Sparkles } from "lucide-react";
import {
  FormInput,
  FormLabel,
  FormSelect,
  PrimaryButton,
} from "@/components/AuthShell";
import { INDIAN_STATES } from "@/lib/indianStates";
import { LANGUAGES } from "@/lib/languages";
import { districtsFor } from "@/lib/districts";

type ProfileForm = {
  state: string;
  district: string;
  village: string;
  primaryCrops: string;
  farmSizeAcres: string;
  preferredLanguage: string;
  phone: string;
  lat?: number;
  lon?: number;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    state: "",
    district: "",
    village: "",
    primaryCrops: "",
    farmSizeAcres: "",
    preferredLanguage: "en",
    phone: "",
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.data) return;
        setForm({
          state: data.data.state || "",
          district: data.data.district || "",
          village: data.data.village || "",
          primaryCrops: (data.data.primaryCrops ?? []).join(", "),
          farmSizeAcres: data.data.farmSizeAcres?.toString() ?? "",
          preferredLanguage: data.data.preferredLanguage || "en",
          phone: data.data.phone || "",
          lat: data.data.lat,
          lon: data.data.lon,
        });
      })
      .catch(() => toast.error("Couldn’t load existing profile"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }));
        toast.success("Location captured");
        setLocating(false);
      },
      (err) => {
        toast.error(err.message || "Couldn’t get location");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.state) {
      toast.error("Please pick your state");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        state: form.state,
        district: form.district.trim(),
        village: form.village.trim(),
        primaryCrops: form.primaryCrops
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        farmSizeAcres: form.farmSizeAcres ? Number(form.farmSizeAcres) : undefined,
        preferredLanguage: form.preferredLanguage,
        phone: form.phone.trim(),
        lat: form.lat,
        lon: form.lon,
      };
      const res = await axios.patch("/api/users/profile", payload);
      if (res.status === 200) {
        toast.success("Profile saved");
        router.push("/profile");
      }
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
            One-time setup
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 mb-2">
            Tell us where you farm.
          </h1>
          <p className="text-stone-600">
            We use this to show prices, weather and alerts for your district. You can change it
            anytime.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="state" hint="required">
                State
              </FormLabel>
              <FormSelect
                id="state"
                value={form.state}
                onChange={(e) =>
                  // Reset district when state changes so a stale district
                  // from a different state can't linger.
                  setForm((f) => ({ ...f, state: e.target.value, district: "" }))
                }
                required
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <FormLabel htmlFor="district">District</FormLabel>
              {districtsFor(form.state).length > 0 ? (
                <FormSelect
                  id="district"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                >
                  <option value="">Select district</option>
                  {districtsFor(form.state).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </FormSelect>
              ) : (
                <FormInput
                  id="district"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  placeholder={form.state ? "Type your district" : "Pick a state first"}
                  disabled={!form.state}
                />
              )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="village">Village (optional)</FormLabel>
            <FormInput
              id="village"
              value={form.village}
              onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
              placeholder="e.g. Doddaballapur"
            />
          </div>

          <div>
            <FormLabel
              htmlFor="primaryCrops"
              hint={<span>Comma-separated</span>}
            >
              Crops you grow
            </FormLabel>
            <FormInput
              id="primaryCrops"
              value={form.primaryCrops}
              onChange={(e) => setForm((f) => ({ ...f, primaryCrops: e.target.value }))}
              placeholder="Tomato, Rice, Maize"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="farmSize">Farm size (acres)</FormLabel>
              <FormInput
                id="farmSize"
                type="number"
                min="0"
                step="0.1"
                value={form.farmSizeAcres}
                onChange={(e) => setForm((f) => ({ ...f, farmSizeAcres: e.target.value }))}
                placeholder="e.g. 2.5"
              />
            </div>

            <div>
              <FormLabel htmlFor="lang">Preferred language</FormLabel>
              <FormSelect
                id="lang"
                value={form.preferredLanguage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferredLanguage: e.target.value }))
                }
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div>
            <FormLabel htmlFor="phone">Phone (optional)</FormLabel>
            <FormInput
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91 …"
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-stone-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900">Location for weather</p>
              <p className="text-xs text-stone-600 mt-0.5">
                {form.lat && form.lon
                  ? `Saved: ${form.lat.toFixed(3)}, ${form.lon.toFixed(3)}`
                  : "Optional — gets the forecast tied to your exact spot."}
              </p>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="text-sm text-stone-700 hover:text-stone-900 underline disabled:opacity-50 flex-shrink-0"
            >
              {locating ? "Locating…" : form.lat ? "Update" : "Use my location"}
            </button>
          </div>

          <PrimaryButton type="submit" disabled={saving} className="mt-2">
            {saving ? "Saving…" : "Save and continue"}
          </PrimaryButton>

          <div className="flex items-center justify-between pt-2 text-sm">
            <Link href="/" className="text-stone-500 hover:text-stone-900">
              Skip for now
            </Link>
            <span className="text-stone-400 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Powers personalized chat
            </span>
          </div>
        </form>
      </div>
    </main>
  );
}
