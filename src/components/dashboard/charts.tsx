"use client";

import { useRouter } from "next/navigation";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { DashboardData, PatientStatus } from "@/lib/types";

// Single-series charts use the brand accent; the status donut uses validated categorical slots 1–3.
// Theme tokens from app/themes.css; SVG presentation attributes resolve CSS variables.
const ACCENT = "var(--chart-accent, #3f8a66)";
const ACCENT_SOFT = "var(--chart-soft, #7fb39a)";
export const STATUS_COLORS: Record<PatientStatus, string> = { Active: "#2a78d6", "Follow-up": "#eb6834", Recovered: "#1baf7a" };
const axisTick = { fill: "#7a867e", fontSize: 11 };
const tooltipStyle = { border: "1px solid #e6ebe5", borderRadius: 8, fontSize: 12, boxShadow: "0 6px 20px #2c3e3314" };

export function IntakeChart({ data }: { data: DashboardData["monthly"] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="intakeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#edf0ec" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} dy={8} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#b9c8bd", strokeDasharray: "3 3" }} formatter={(value) => [value, "New patients"]} />
        <Area type="monotone" dataKey="patients" name="New patients" stroke={ACCENT} strokeWidth={2} fill="url(#intakeFill)" animationDuration={600} activeDot={{ r: 5, fill: ACCENT, stroke: "white", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DoctorGrowthChart({ data }: { data: DashboardData["monthly"] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 6, right: 4, left: -14, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke="#edf0ec" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ ...axisTick, fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f1" }} formatter={(value) => [value, "Doctors added"]} />
        <Bar dataKey="doctors" name="Doctors added" fill={ACCENT_SOFT} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PatientsPerDoctorChart({ data }: { data: DashboardData["patientsByDoctor"] }) {
  const router = useRouter();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }} barCategoryGap="28%">
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ ...axisTick, fill: "#4c5d52" }} width={118} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "#f1f5f1" }}
          formatter={(value) => [value, "Patients"]}
          labelFormatter={(label, payload) => `${label} · ${payload?.[0]?.payload?.specialization ?? ""}`}
        />
        <Bar
          dataKey="count"
          fill={ACCENT}
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
          animationDuration={600}
          label={{ position: "right", fill: "#4c5d52", fontSize: 11 }}
          cursor="pointer"
          onClick={(entry) => { const id = (entry as unknown as { payload?: { id?: string } }).payload?.id; if (id) router.push(`/doctors/${id}`); }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ byStatus, total }: { byStatus: DashboardData["byStatus"]; total: number }) {
  const data = (Object.keys(STATUS_COLORS) as PatientStatus[]).map((status) => ({ name: status, value: byStatus[status] }));
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} (${total ? Math.round((Number(value) / total) * 100) : 0}%)`, name]} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="92%" paddingAngle={total ? 2 : 0} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
            {data.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>{total}</strong><span>patients</span></div>
    </div>
  );
}
