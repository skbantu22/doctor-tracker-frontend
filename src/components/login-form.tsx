"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import type { Session } from "@/lib/types";

// Optional demo account for reviewers. The button only renders when both values are configured.
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";
const hasDemo = Boolean(DEMO_EMAIL && DEMO_PASSWORD);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"form" | "demo" | null>(null);

  async function signIn(email: string, password: string, source: "form" | "demo") {
    setPending(source);
    setError("");
    try {
      const session = await api<Session>("/auth/login", { method: "POST", body: { email, password } });
      queryClient.setQueryData(queryKeys.session, session);
      const next = searchParams.get("next");
      // Only follow same-site relative paths to avoid open redirects.
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setPending(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void signIn(String(form.get("email")), String(form.get("password")), "form");
  }

  return (
    <>
      <form onSubmit={submit} className="login-form">
        <label>Email address<input name="email" type="email" placeholder="admin@clinic.com" autoComplete="username" required /></label>
        <label>Password
          <span className="password-input">
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </span>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button-primary login-submit" type="submit" disabled={pending !== null}>{pending === "form" ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
      </form>

      {hasDemo && (
        <div className="demo-login">
          <div className="demo-divider"><span>or</span></div>
          <button type="button" className="demo-button" onClick={() => signIn(DEMO_EMAIL, DEMO_PASSWORD, "demo")} disabled={pending !== null}>
            <Sparkles size={16} /> {pending === "demo" ? "Opening demo…" : "Sign in with demo account"}
          </button>
          <p className="demo-credentials">Demo: <code>{DEMO_EMAIL}</code> · <code>{DEMO_PASSWORD}</code></p>
        </div>
      )}
    </>
  );
}
