"use client";

import { CalendarDays, Plus, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

const ranges = [3, 6, 12] as const;

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type Props = {
  months: number;
  onMonths: (months: number) => void;
  fetching: boolean;
  thisMonth?: number;
  onAddDoctor: () => void;
  onAddPatient: () => void;
};

export function DashboardHero({ months, onMonths, fetching, thisMonth, onAddDoctor, onAddPatient }: Props) {
  // Time-of-day text is set after mount so the prerendered HTML and the first client render match.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setNow(new Date()));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden />
      <div className="hero-main">
        <span className="hero-date">
          <CalendarDays size={14} />
          {now ? new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(now) : "Clinic overview"}
        </span>
        <h1 id="hero-title">{now ? greetingFor(now.getHours()) : "Welcome back"}<span className="hero-dot">.</span></h1>
        <p>
          {thisMonth === undefined
            ? "Here’s how your clinic is doing."
            : <>Your clinic welcomed <strong>{thisMonth} new {thisMonth === 1 ? "patient" : "patients"}</strong> this month. Here’s the full picture.</>}
        </p>
        <div className="hero-actions">
          <button className="hero-button hero-button-primary" onClick={onAddPatient}><UserPlus size={16} /> Add patient</button>
          <button className="hero-button" onClick={onAddDoctor}><Plus size={16} /> Add doctor</button>
          <span className="hero-kbd"><Sparkles size={13} /> Press <kbd>Ctrl</kbd> <kbd>K</kbd> to search anything</span>
        </div>
      </div>
      <div className="hero-side">
        <span className="hero-side-label">Date range</span>
        <div className="hero-segmented" role="group" aria-label="Date range">
          {ranges.map((range) => (
            <button key={range} className={range === months ? "is-active" : ""} aria-pressed={range === months} onClick={() => onMonths(range)}>
              {range}M
            </button>
          ))}
        </div>
        <span className={`hero-sync${fetching ? " is-busy" : ""}`}><span aria-hidden />{fetching ? "Updating…" : "Live data"}</span>
      </div>
    </section>
  );
}
