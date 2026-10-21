"use client";

import { Activity, ArrowRight, BarChart3, HeartPulse, Plus, Stethoscope, TrendingUp, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useDashboard } from "@/lib/queries";
import { patientStatuses, type NamedCount } from "@/lib/types";
import { DoctorFormModal } from "../doctors/doctor-form-modal";
import { ErrorState, PageHeading } from "../ui/feedback";
import { InsightsCard } from "./insights-card";

// Recharts is the heaviest client dependency; load it only on the dashboard, after the shell paints.
const chartFallback = () => <div className="chart-loading" aria-hidden />;
const IntakeChart = dynamic(() => import("./charts").then((mod) => mod.IntakeChart), { ssr: false, loading: chartFallback });
const DoctorGrowthChart = dynamic(() => import("./charts").then((mod) => mod.DoctorGrowthChart), { ssr: false, loading: chartFallback });
const PatientsPerDoctorChart = dynamic(() => import("./charts").then((mod) => mod.PatientsPerDoctorChart), { ssr: false, loading: chartFallback });
const StatusDonut = dynamic(() => import("./charts").then((mod) => mod.StatusDonut), { ssr: false, loading: chartFallback });

// Mirrors STATUS_COLORS in ./charts without pulling the chart bundle into this module.
const statusColors = { Active: "#2a78d6", "Follow-up": "#eb6834", Recovered: "#1baf7a" } as const;
const ranges = [3, 6, 12] as const;

export function DashboardView() {
  const { values, update } = useUrlFilters(["months"] as const);
  const months = ranges.find((value) => String(value) === values.months) ?? 6;
  const dashboard = useDashboard(months);
  const [addingDoctor, setAddingDoctor] = useState(false);
  const data = dashboard.data;
  const loading = dashboard.isLoading;

  return (
    <>
      <PageHeading
        kicker={`CLINIC SUMMARY · ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase()}`}
        title="Dashboard"
        description="Clinic activity, patient intake and care team workload."
        action={<button className="button-primary" onClick={() => setAddingDoctor(true)}><Plus size={17} /> Add doctor</button>}
      />

      <div className="range-bar" role="group" aria-label="Date range">
        <span>Showing the last</span>
        <div className="segmented">
          {ranges.map((range) => (
            <button key={range} className={range === months ? "is-active" : ""} aria-pressed={range === months} onClick={() => update({ months: range === 6 ? "" : String(range) })}>{range} months</button>
          ))}
        </div>
        {dashboard.isFetching && !loading && <span className="refreshing">Updating…</span>}
      </div>

      {dashboard.isError ? <ErrorState message={dashboard.error.message} onRetry={() => dashboard.refetch()} /> : (
        <>
          <section className="metric-grid" aria-label="Clinic summary">
            <MetricCard label="Total doctors" value={data?.doctorCount} hint="In your directory" icon={<Stethoscope size={18} />} accent="mint" />
            <MetricCard label="Total patients" value={data?.patientCount} hint="Across all doctors" icon={<Users size={18} />} accent="peach" />
            <MetricCard label={`New patients · ${months} mo`} value={data?.newPatients} hint="Added in the selected range" icon={<TrendingUp size={18} />} accent="blue" />
            <MetricCard label="Patients per doctor" value={data?.averagePerDoctor} hint="Average caseload" icon={<Activity size={18} />} accent="mint" />
          </section>

          <InsightsCard months={months} enabled={Boolean(data) && !dashboard.isPlaceholderData} />

          <section className="dashboard-grid">
            <ChartPanel kicker="DATE-BASED · PATIENT INTAKE" title="New patients per month" className="activity-panel"
              summary={data && <div className="chart-summary"><strong>{data.newPatients.toLocaleString()}</strong><span>new patients in the last {months} months</span></div>}
            >
              <div className="chart-wrap">{loading ? <div className="chart-loading" /> : data && data.newPatients > 0 ? <IntakeChart data={data.monthly} /> : <ChartEmpty text="Add patients to see intake trends." />}</div>
            </ChartPanel>
            <ChartPanel kicker="CARE STATUS" title="Patient distribution" className="status-panel">
              {loading ? <div className="chart-loading donut-loading" /> : data && (
                <>
                  <StatusDonut byStatus={data.byStatus} total={data.patientCount} />
                  <ul className="donut-legend">
                    {patientStatuses.map((status) => (
                      <li key={status}><i style={{ background: statusColors[status] }} />{status}<strong>{data.byStatus[status]}</strong><span>{data.patientCount ? Math.round((data.byStatus[status] / data.patientCount) * 100) : 0}%</span></li>
                    ))}
                  </ul>
                </>
              )}
            </ChartPanel>
          </section>

          <section className="dashboard-grid dashboard-grid-even">
            <ChartPanel kicker="CARE TEAM" title="Patients per doctor" action={<Link className="panel-inline-link" href="/doctors">All doctors <ArrowRight size={13} /></Link>}>
              <div className="chart-wrap chart-tall">
                {loading ? <div className="chart-loading" /> : data?.patientsByDoctor.length ? <PatientsPerDoctorChart data={data.patientsByDoctor} /> : <ChartEmpty text="Assign patients to doctors to compare caseloads." />}
              </div>
              <p className="chart-note">Top {data?.patientsByDoctor.length ?? 0} doctors by caseload. Select a bar to open that doctor.</p>
            </ChartPanel>
            <ChartPanel kicker="DATE-BASED · CARE TEAM GROWTH" title="Doctors added per month">
              <div className="chart-wrap chart-tall">{loading ? <div className="chart-loading" /> : data && <DoctorGrowthChart data={data.monthly} />}</div>
              <p className="chart-note">{data ? data.monthly.reduce((sum, row) => sum + row.doctors, 0) : 0} doctors joined in the last {months} months.</p>
            </ChartPanel>
          </section>

          <section className="dashboard-grid dashboard-grid-even">
            <ChartPanel kicker="PATIENT MIX" title="Most common conditions" action={<HeartPulse size={17} className="panel-muted-icon" />}>
              <RankList items={data?.conditions} total={data?.patientCount ?? 0} loading={loading} hrefFor={(name) => `/patients?condition=${encodeURIComponent(name)}`} empty="No patient conditions recorded yet." />
            </ChartPanel>
            <ChartPanel kicker="SPECIALTIES" title="Doctors by specialty" action={<BarChart3 size={17} className="panel-muted-icon" />}>
              <RankList items={data?.specializations} total={data?.doctorCount ?? 0} loading={loading} hrefFor={(name) => `/doctors?specialization=${encodeURIComponent(name)}`} empty="No doctors added yet." />
            </ChartPanel>
          </section>
        </>
      )}

      {addingDoctor && <DoctorFormModal onClose={() => setAddingDoctor(false)} />}
    </>
  );
}

function MetricCard({ label, value, hint, icon, accent }: { label: string; value?: number; hint: string; icon: ReactNode; accent: string }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span className={`metric-icon metric-${accent}`}>{icon}</span></div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value === undefined ? <span className="skeleton-text" /> : value.toLocaleString()}</strong>
      <span className="metric-hint">{hint}</span>
    </article>
  );
}

function ChartPanel({ kicker, title, action, summary, className = "", children }: { kicker: string; title: string; action?: ReactNode; summary?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <article className={`panel chart-panel ${className}`}>
      <div className="panel-heading"><div><span className="panel-kicker">{kicker}</span><h2>{title}</h2></div>{action}</div>
      {summary}
      {children}
    </article>
  );
}

function ChartEmpty({ text }: { text: string }) {
  return <div className="empty-chart"><span className="empty-chart-icon"><Activity size={18} /></span><strong>Nothing to chart yet</strong><span>{text}</span></div>;
}

function RankList({ items, total, loading, hrefFor, empty }: { items?: NamedCount[]; total: number; loading: boolean; hrefFor: (name: string) => string; empty: string }) {
  if (loading) return <div className="chart-loading rank-loading" />;
  if (!items?.length) return <p className="panel-empty-text">{empty}</p>;
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <ul className="condition-list">
      {items.map((item) => (
        <li key={item.name}>
          <Link className="condition-row" href={hrefFor(item.name)}>
            <span className="condition-name">{item.name}</span>
            <strong>{item.count}<small> · {total ? Math.round((item.count / total) * 100) : 0}%</small></strong>
            <span className="condition-track"><span style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
