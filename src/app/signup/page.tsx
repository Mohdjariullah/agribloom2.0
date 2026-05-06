"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AuthShell, {
  FormInput,
  FormLabel,
  FormSelect,
  PrimaryButton,
} from "@/components/AuthShell";
import { T } from "@/components/T";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "farmer",
    adminKey: "",
  });
  const [loading, setLoading] = useState(false);

  const buttonDisabled =
    !user.username || !user.email || !user.password || user.password.length < 6 || loading;

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buttonDisabled) return;
    try {
      setLoading(true);
      const payload: Record<string, unknown> = {
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
      };
      if (user.role === "admin") payload.adminKey = user.adminKey;

      await axios.post("/api/users/signup", payload);
      toast.success("Account created. Check your email to verify.");
      router.push("/login");
    } catch (error: unknown) {
      let msg = "Signup failed";
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
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Save your state and crops to get personalized insights."
      footer={
        <>
          <T>Already have an account?</T>{" "}
          <Link href="/login" className="text-stone-900 font-medium hover:underline">
            <T>Sign in</T>
          </Link>
        </>
      }
    >
      <form onSubmit={onSignup} className="space-y-4">
        <div>
          <FormLabel htmlFor="username">Name</FormLabel>
          <FormInput
            id="username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </div>

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
          <FormLabel
            htmlFor="password"
            hint={<span>{user.password.length}/6+</span>}
          >
            Password
          </FormLabel>
          <FormInput
            id="password"
            type="password"
            autoComplete="new-password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>

        <div>
          <FormLabel htmlFor="role">I&apos;m signing up as</FormLabel>
          <FormSelect
            id="role"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value, adminKey: "" })}
          >
            <option value="farmer">Farmer</option>
            <option value="admin">Admin</option>
          </FormSelect>
        </div>

        {user.role === "admin" && (
          <div>
            <FormLabel htmlFor="adminKey">Admin key</FormLabel>
            <FormInput
              id="adminKey"
              type="text"
              value={user.adminKey}
              onChange={(e) => setUser({ ...user, adminKey: e.target.value })}
              placeholder="Provided by your administrator"
              required
            />
          </div>
        )}

        <PrimaryButton type="submit" disabled={buttonDisabled} className="mt-2">
          {loading ? <T>Creating account…</T> : <T>Create account</T>}
        </PrimaryButton>

        <p className="text-xs text-stone-500 text-center pt-1">
          <T>By signing up you agree to receive farming alerts and tips.</T>
        </p>
      </form>
    </AuthShell>
  );
}
