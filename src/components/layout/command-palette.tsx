"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CornerDownLeft, LayoutDashboard, Search, Stethoscope, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api, toQueryString } from "@/lib/api";
import type { ApiPage, Doctor, Patient } from "@/lib/types";

type Item = { id: string; group: string; title: string; subtitle?: string; href: string; icon: typeof Search };

const pages: Item[] = [
  { id: "nav-dashboard", group: "Go to", title: "Dashboard", subtitle: "Analytics and AI insights", href: "/dashboard", icon: LayoutDashboard },
  { id: "nav-doctors", group: "Go to", title: "Doctors", subtitle: "Directory, filters and caseloads", href: "/doctors", icon: Stethoscope },
  { id: "nav-patients", group: "Go to", title: "Patients", subtitle: "All patient records", href: "/patients", icon: Users },
];

/** Global quick search (Ctrl/⌘ + K): jumps to pages, doctors and patients using the existing indexed search API. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const term = useDebouncedValue(query.trim(), 200);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, [open]);

  const params = toQueryString({ search: term, limit: 5 });
  const doctors = useQuery({
    queryKey: ["doctors", "list", { search: term, limit: 5 }],
    queryFn: () => api<ApiPage<Doctor>>(`/doctors?${params}`),
    enabled: open && term.length > 0,
  });
  const patients = useQuery({
    queryKey: ["patients", "list", { search: term, limit: 5 }],
    queryFn: () => api<ApiPage<Patient>>(`/patients?${params}`),
    enabled: open && term.length > 0,
  });

  const items = useMemo<Item[]>(() => {
    const lower = term.toLowerCase();
    const nav = pages.filter((page) => !lower || page.title.toLowerCase().includes(lower));
    if (!term) return nav;
    const doctorItems = (doctors.data?.data ?? []).map<Item>((doctor) => ({
      id: `doctor-${doctor._id}`, group: "Doctors", title: doctor.name, subtitle: `${doctor.specialization} · ${doctor.hospital}`, href: `/doctors/${doctor._id}`, icon: Stethoscope,
    }));
    const patientItems = (patients.data?.data ?? []).map<Item>((patient) => ({
      id: `patient-${patient._id}`, group: "Patients", title: patient.name, subtitle: `${patient.condition} · ${patient.status}`, href: `/patients?search=${encodeURIComponent(patient.name)}`, icon: User,
    }));
    return [...nav, ...doctorItems, ...patientItems];
  }, [term, doctors.data, patients.data]);

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  function go(item: Item | undefined) {
    if (!item) return;
    close();
    router.push(item.href);
  }

  if (!open) return null;
  const loading = term.length > 0 && (doctors.isFetching || patients.isFetching);

  return (
    <div className="palette-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
        <div className="palette-input">
          <Search size={18} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            placeholder="Search doctors, patients or pages…"
            aria-label="Search"
            aria-controls="palette-results"
            aria-activedescendant={items[active]?.id}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(index + 1, items.length - 1)); }
              else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(index - 1, 0)); }
              else if (event.key === "Enter") { event.preventDefault(); go(items[active]); }
              else if (event.key === "Escape") { event.preventDefault(); close(); }
            }}
          />
          {loading ? <span className="palette-spinner" aria-hidden /> : <kbd>Esc</kbd>}
        </div>
        <ul className="palette-results" id="palette-results" role="listbox">
          {items.map((item, index) => {
            const header = index === 0 || items[index - 1].group !== item.group ? item.group : null;
            const Icon = item.icon;
            return (
              <li key={item.id} role="presentation">
                {header && <div className="palette-group">{header}</div>}
                <button
                  id={item.id}
                  role="option"
                  aria-selected={index === active}
                  className={`palette-item${index === active ? " is-active" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(item)}
                >
                  <span className="palette-icon"><Icon size={16} /></span>
                  <span className="palette-text"><strong>{item.title}</strong>{item.subtitle && <small>{item.subtitle}</small>}</span>
                  <ArrowRight size={15} className="palette-arrow" aria-hidden />
                </button>
              </li>
            );
          })}
          {term && !loading && items.length === 0 && <li className="palette-empty">No matches for “{term}”.</li>}
        </ul>
        <footer className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd><CornerDownLeft size={11} /></kbd> open</span>
          <span><kbd>Ctrl</kbd><kbd>K</kbd> toggle</span>
        </footer>
      </div>
    </div>
  );
}
