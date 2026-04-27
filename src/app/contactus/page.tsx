"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/PageHeader";

type FormData = { name: string; email: string; message: string };

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // No backend yet — pretend success.
      await new Promise((r) => setTimeout(r, 700));
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (success) setSuccess(false);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you need."
        subtitle="Bug reports, feature requests, partnership questions — we read everything."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={onSubmit}
            className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm text-stone-700 mb-1.5 inline-block">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={onChange}
                  placeholder="Your name"
                  className="bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm text-stone-700 mb-1.5 inline-block">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  className="bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm text-stone-700 mb-1.5 inline-block">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={onChange}
                rows={6}
                placeholder="What's on your mind?"
                className="bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-stone-500">
                We typically reply within 1–2 working days.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                {submitting ? (
                  "Sending…"
                ) : (
                  <>
                    Send <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Thanks — your message is in. We&apos;ll get back to you soon.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
              Reach us
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:hello@agribloom.in"
                  className="flex items-center gap-2.5 text-stone-700 hover:text-stone-900"
                >
                  <span className="bg-stone-100 text-stone-700 p-1.5 rounded-md">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  hello@agribloom.in
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-stone-700">
                <span className="bg-stone-100 text-stone-700 p-1.5 rounded-md">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                India
              </li>
            </ul>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
              Are you a farmer?
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              You can also use the in-app assistant — it can answer most questions about crops,
              prices, weather and schemes instantly.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
