"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { THEME_STORAGE_KEY, themes, type ThemeId } from "@/lib/themes";

function currentTheme(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return (themes.find((theme) => theme.id === value)?.id ?? "forest") as ThemeId;
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeId>("forest");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setActive(currentTheme()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(id: ThemeId) {
    document.documentElement.setAttribute("data-theme", id);
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch { /* storage unavailable: theme still applies for this visit */ }
    setActive(id);
    setOpen(false);
  }

  return (
    <div className="theme-switcher" ref={ref}>
      <button className="help-button" onClick={() => setOpen((value) => !value)} aria-label="Change theme" aria-expanded={open} title="Theme">
        <Palette size={17} />
      </button>
      {open && (
        <div className="theme-menu" role="menu" aria-label="Theme">
          <span className="theme-menu-title">Theme</span>
          {themes.map((theme) => (
            <button key={theme.id} role="menuitemradio" aria-checked={active === theme.id} className={`theme-option${active === theme.id ? " is-active" : ""}`} onClick={() => choose(theme.id)}>
              <span className="theme-swatch" aria-hidden>
                {theme.swatch.map((color) => <i key={color} style={{ background: color }} />)}
              </span>
              <span>{theme.label}</span>
              {active === theme.id && <Check size={15} className="theme-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
