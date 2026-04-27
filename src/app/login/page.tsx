"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell, { FormInput, FormLabel, PrimaryButton } from "@/components/AuthShell";

function LoginForm() {
  const router = useRouter();
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
      if (!profileCompleted) {
        router.push("/complete-profile");
        return;
      }
      if (explicitRedirect) {
        router.push(explicitRedirect);
        return;
      }
      // Role-based home
      router.push(role === "admin" ? "/admin/dashboard" : "/farmer/dashboard");
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
        {loading ? "Signing in…" : "Sign in"}
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
          New to AgriBloom?{" "}
          <Link href="/signup" className="text-stone-900 font-medium hover:underline">
            Create an account
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
