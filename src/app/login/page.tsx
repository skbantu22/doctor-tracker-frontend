import { BarChart3, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in | Doctor Tracker" };

const features = [
  { icon: Stethoscope, title: "Doctor directory", detail: "Search, filter and manage every provider." },
  { icon: Users, title: "Connected patients", detail: "Each patient linked to their care team." },
  { icon: BarChart3, title: "Live analytics", detail: "Intake trends, caseloads and AI insights." },
];

// Decorative preview of the dashboard; static numbers, hidden from assistive tech.
const bars = [38, 52, 44, 61, 58, 74, 69, 88];

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-showcase" aria-label="About Doctor Tracker">
        <div className="auth-brand">
          <span className="auth-mark"><HeartPulse size={20} /></span>
          <span><strong>Doctor Tracker</strong><small>CLINIC ADMIN</small></span>
        </div>

        <div className="auth-copy">
          <span className="auth-eyebrow">CLINIC OPERATIONS, SIMPLIFIED</span>
          <h1>Every doctor, every patient, one clear view.</h1>
          <p>Manage your care team, keep patient records connected and see how your clinic is growing — all in one secure workspace.</p>
          <ul className="auth-features">
            {features.map(({ icon: Icon, title, detail }) => (
              <li key={title}><span><Icon size={17} /></span><div><strong>{title}</strong><small>{detail}</small></div></li>
            ))}
          </ul>
        </div>

        <div className="auth-preview" aria-hidden>
          <div className="preview-stats">
            <div><small>Doctors</small><strong>10</strong></div>
            <div><small>Patients</small><strong>140</strong></div>
            <div><small>Intake</small><strong className="preview-up">+23%</strong></div>
          </div>
          <div className="preview-bars">{bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
        </div>

        <div className="auth-footer"><ShieldCheck size={14} /> HTTP-only sessions · Indexed MongoDB · Role-protected routes</div>
      </section>

      <section className="auth-panel">
        <div className="login-card auth-card">
          <span className="login-overline">ADMIN PORTAL</span>
          <h2>Welcome back</h2>
          <p>Sign in with your clinic administrator account.</p>
          <Suspense><LoginForm /></Suspense>
        </div>
        <p className="auth-note">Protected area · Authorized clinic staff only</p>
      </section>
    </main>
  );
}
