import { HeartPulse } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in | Doctor Tracker" };

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-visual">
        <span className="brand login-brand"><span className="brand-mark"><HeartPulse size={19} /></span><span className="brand-copy"><strong>Doctor Tracker</strong><small>CLINIC ADMIN</small></span></span>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="login-overline">ADMIN PORTAL</span>
          <h2>Sign in</h2>
          <p>Use your clinic administrator credentials.</p>
          <Suspense><LoginForm /></Suspense>
          <div className="login-security"><span><span className="security-dot" /> PRIVATE ADMIN ACCESS</span><span>HTTP-only session</span></div>
        </div>
        <div className="login-footnote">Doctors, patients and clinic analytics in one place.</div>
      </section>
    </main>
  );
}
