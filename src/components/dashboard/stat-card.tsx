"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { memo, useId, type ReactNode } from "react";
import { useCountUp } from "@/hooks/use-count-up";

type Props = {
  label: string;
  value?: number;
  decimals?: number;
  hint: string;
  icon: ReactNode;
  tone: "forest" | "amber" | "ocean" | "plum";
  series?: number[];
  delta?: number | null;
};

/** Single-series sparkline: no axes, last point marked; the label above names the series. */
function Sparkline({ series, tone }: { series: number[]; tone: Props["tone"] }) {
  const id = useId();
  if (series.length < 2) return null;
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const span = max - min || 1;
  const points = series.map((value, index) => [(index / (series.length - 1)) * 100, 30 - ((value - min) / span) * 26] as const);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];
  return (
    <svg className={`sparkline spark-${tone}`} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100,32 L0,32 Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="2.6" fill="currentColor" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export const StatCard = memo(function StatCard({ label, value, decimals = 0, hint, icon, tone, series, delta }: Props) {
  const animated = useCountUp(value);
  const display = value === undefined ? null : animated.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const trend = delta === undefined || delta === null ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        {trend && (
          <span className={`stat-delta delta-${trend}`} title="This month vs last month">
            <TrendIcon size={13} aria-hidden />{Math.abs(delta!)}%<span className="sr-only"> vs last month</span>
          </span>
        )}
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{display ?? <span className="skeleton-text" />}</strong>
      <div className="stat-bottom">
        <span className="stat-hint">{hint}</span>
        {series && <Sparkline series={series} tone={tone} />}
      </div>
    </article>
  );
});
