"use client";

import { useQueryClient } from "@tanstack/react-query";
import { HeartPulse, LayoutDashboard, LogOut, Search, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";
import { useSession } from "@/lib/queries";
import { PageSkeleton } from "../ui/feedback";
import { CommandPalette } from "./command-palette";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
] as const;

function useActiveItem() {
  const pathname = usePathname();
  return navItems.find((item) => pathname.startsWith(item.href));
}

function NavLinks({ highlight = true }: { highlight?: boolean }) {
  const active = useActiveItem();
  return navItems.map(({ href, label, icon: Icon }) => {
    const isActive = highlight && active?.href === href;
    return (
      <Link key={href} href={href} className={`nav-button${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
        <Icon size={18} /><span>{label}</span>
      </Link>
    );
  });
}

function StaticNavLinks() {
  return navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="nav-button"><Icon size={18} /><span>{label}</span></Link>);
}

function CurrentSection() {
  return <strong>{useActiveItem()?.label ?? "Workspace"}</strong>;
}

/** Re-keys page content on route change so each page fades in. */
function PageTransition({ children }: { children: ReactNode }) {
  return <div key={usePathname()} className="page-transition">{children}</div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const email = session.data?.admin.email ?? "";

  async function signOut() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    queryClient.clear();
    router.replace("/login");
  }

  // Pathname-dependent pieces are small and wrapped in <Suspense>, so the rest of the shell can prerender.
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark"><HeartPulse size={19} strokeWidth={2.3} /></span>
          <span className="brand-copy"><strong>Doctor Tracker</strong><small>CLINIC ADMIN</small></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <Suspense fallback={<StaticNavLinks />}><NavLinks /></Suspense>
        </nav>
        <div className="sidebar-bottom">
          <button className="profile-row" onClick={signOut} title="Sign out">
            <span className="avatar avatar-sage">{email ? initials(email.split("@")[0]) : "·"}</span>
            <span className="profile-copy"><strong>Clinic admin</strong><small>{email || "Loading…"}</small></span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="main-area" id="main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Doctor Tracker</span><span className="crumb-slash">/</span>
            <Suspense fallback={<strong>Workspace</strong>}><CurrentSection /></Suspense>
          </div>
          <div className="topbar-right">
            <button className="search-trigger" onClick={() => window.dispatchEvent(new Event("open-command-palette"))} aria-label="Search (Ctrl+K)">
              <Search size={15} /><span>Search…</span><kbd>Ctrl K</kbd>
            </button>
            <span className="topbar-divider" />
            <button className="help-button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
          </div>
        </header>
        <div className="page-content">
          <Suspense fallback={<PageSkeleton />}><PageTransition>{children}</PageTransition></Suspense>
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
