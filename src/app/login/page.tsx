"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import AuthShell, { FormInput, FormLabel, PrimaryButton } from "@/components/AuthShell";
import { T } from "@/components/T";

function LoginForm() {
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");

  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const buttonDisabled = !user.email || !user.password || loading;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buttonDisabled) return;
    try {
      setLoading(true);
      const res = await axios.post("/api/users/login", user);
      toast.success("Logged in");

      const { profileCompleted, role } = res.data;
      const target = !profileCompleted
        ? "/complete-profile"
        : explicitRedirect || (role === "admin" ? "/admin/dashboard" : "/farmer/dashboard");

      // Hard navigation (not router.push) so the freshly-set auth cookie is
      // re-evaluated by middleware and the Next.js router cache — which can hold
      // logged-out prefetches of protected routes — is fully cleared. This is
      // what fixes "logged in but bounced back to login" on mobile.
      window.location.assign(target);
      return;
    } catch (error: unknown) {
      let msg = "Login failed";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        msg = (error.response.data as { message?: string }).message || msg;
      }
      if (msg === "Invalid credentials") msg = "Incorrect email or password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onLogin} className="space-y-4">
      <div>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          type="email"
          autoComplete="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <FormLabel htmlFor="password">Password</FormLabel>
        <FormInput
          id="password"
          type="password"
          autoComplete="current-password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="••••••••"
          required
        />
      </div>

      <PrimaryButton type="submit" disabled={buttonDisabled} className="mt-2">
        <T>{loading ? "Signing in…" : "Sign in"}</T>
      </PrimaryButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your crops, prices and saved district."
      footer={
        <>
          <T>New to AgriBloom?</T>{" "}
          <Link href="/signup" className="text-stone-900 font-medium hover:underline">
            <T>Create an account</T>
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-stone-500 text-sm">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
