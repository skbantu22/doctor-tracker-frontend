import { AlertCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { avatarTone, initials } from "@/lib/format";
import type { PatientStatus } from "@/lib/types";

export function EmptyState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-state-icon">{icon}</span><strong>{title}</strong><span>{detail}</span>{action}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty-state error-state" role="alert">
      <span className="empty-state-icon"><AlertCircle size={20} /></span>
      <strong>Couldn&apos;t load this data</strong>
      <span>{message}</span>
      <button className="button-secondary" onClick={onRetry}>Try again</button>
    </div>
  );
}

export function LoadingRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return <>{Array.from({ length: rows }, (_, row) => <tr key={row} className="loading-row"><td colSpan={columns}><span /></td></tr>)}</>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <span className={`status-badge status-${status.toLowerCase().replace("-", "")}`}><span aria-hidden />{status}</span>;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return <span className={`person-avatar person-${avatarTone(name)}${size === "lg" ? " avatar-lg" : ""}`} aria-hidden>{initials(name)}</span>;
}

export function PersonCell({ name, detail, href }: { name: string; detail: string; href?: string }) {
  return (
    <div className="person-cell">
      <Avatar name={name} />
      <span>{href ? <Link href={href} className="person-link">{name}</Link> : <strong>{name}</strong>}<small>{detail}</small></span>
    </div>
  );
}

export function PageHeading({ kicker, title, description, action }: { kicker: string; title: ReactNode; description: string; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <div><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading">
      <span className="skeleton-block skeleton-title" />
      <span className="skeleton-block skeleton-panel" />
    </div>
  );
}
