"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import type { Session } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const session = await api<Session>("/auth/login", { method: "POST", body: { email: form.get("email"), password: form.get("password") } });
      queryClient.setQueryData(queryKeys.session, session);
      const next = searchParams.get("next");
      // Only follow same-site relative paths to avoid open redirects.
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="login-form">
      <label>Email address<input name="email" type="email" placeholder="admin@clinic.com" autoComplete="username" required /></label>
      <label>Password
        <span className="password-input">
          <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </span>
      </label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button-primary login-submit" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
    </form>
  );
}
