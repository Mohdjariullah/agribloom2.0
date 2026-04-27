"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PageHeader, PageShell } from "@/components/PageHeader";
import { FormInput, FormLabel, FormSelect, PrimaryButton } from "@/components/AuthShell";

type FormState = {
  crop: string;
  district: string;
  village: string;
  sowingDate: string;
  area: string;
  season: "kharif" | "rabi" | "zaid";
};

export default function CropEntryPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    crop: "",
    district: "",
    village: "",
    sowingDate: "",
    area: "",
    season: "kharif",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.id) setUserId(d.user.id);
        // pre-fill district from profile if set
        return fetch("/api/users/profile").then((r) => r.json());
      })
      .then((p) => {
        if (p?.data?.district) {
          setForm((f) => ({ ...f, district: p.data.district, village: p.data.village || "" }));
        }
      })
      .catch(() => {});
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { crop, district, village, sowingDate, area, season } = form;
    if (!crop || !district || !village || !sowingDate || !area || Number(area) <= 0 || !userId) {
      toast.error("Please fill all fields with valid values.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/farmer/crop-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          district,
          village,
          sowingDate,
          area: Number(area),
          season,
          farmerId: userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Couldn't save");
        return;
      }
      toast.success("Crop entry saved");
      router.push("/farmer/dashboard");
    } catch (err) {
      console.error("submit", err);
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="My farm · Crop entry"
        title="Log what you sowed."
        subtitle="Help build trend data for your district. Takes 30 seconds."
      />

      <form
        onSubmit={onSubmit}
        className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8 max-w-2xl space-y-5"
      >
        <div>
          <FormLabel htmlFor="crop">Crop name</FormLabel>
          <FormInput
            id="crop"
            name="crop"
            value={form.crop}
            onChange={onChange}
            placeholder="e.g. Tomato, Rice"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="district">District</FormLabel>
            <FormInput
              id="district"
              name="district"
              value={form.district}
              onChange={onChange}
              placeholder="e.g. Bengaluru Rural"
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="village">Village</FormLabel>
            <FormInput
              id="village"
              name="village"
              value={form.village}
              onChange={onChange}
              placeholder="e.g. Doddaballapur"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FormLabel htmlFor="sowingDate">Sowing date</FormLabel>
            <FormInput
              id="sowingDate"
              name="sowingDate"
              type="date"
              value={form.sowingDate}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="area" hint="acres">
              Area
            </FormLabel>
            <FormInput
              id="area"
              name="area"
              type="number"
              step="0.1"
              min="0"
              value={form.area}
              onChange={onChange}
              placeholder="e.g. 2.5"
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="season">Season</FormLabel>
            <FormSelect id="season" name="season" value={form.season} onChange={onChange}>
              <option value="kharif">Kharif (monsoon)</option>
              <option value="rabi">Rabi (winter)</option>
              <option value="zaid">Zaid (summer)</option>
            </FormSelect>
          </div>
        </div>

        <PrimaryButton type="submit" disabled={submitting} className="mt-2">
          {submitting ? "Saving…" : "Save crop entry"}
        </PrimaryButton>
      </form>
    </PageShell>
  );
}
