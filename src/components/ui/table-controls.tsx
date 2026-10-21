"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { memo, useEffect, useState, type ReactNode } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/** Typing stays local and instant; the URL (and therefore the API request) updates once typing pauses. */
export const SearchField = memo(function SearchField({ value, onChange, placeholder, label }: {
  value: string; onChange: (value: string) => void; placeholder: string; label: string;
}) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const debounced = useDebouncedValue(draft, 300);

  // Adopt external changes (e.g. "Clear filters") without fighting the debounce.
  if (value !== synced) {
    setSynced(value);
    if (value !== debounced) setDraft(value);
  }

  useEffect(() => {
    if (debounced.trim() !== value) onChange(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the settled input
  }, [debounced]);

  return (
    <div className="search-field">
      <Search size={16} aria-hidden />
      <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} aria-label={label} type="search" />
      {draft && <button type="button" className="search-clear" onClick={() => setDraft("")} aria-label="Clear search"><X size={14} /></button>}
    </div>
  );
});

export const SelectFilter = memo(function SelectFilter({ label, value, onChange, allLabel, options, icon }: {
  label: string; value: string; onChange: (value: string) => void; allLabel: string;
  options: readonly (string | { value: string; label: string })[]; icon?: boolean;
}) {
  return (
    <label className={`select-control${value ? " is-set" : ""}`}>
      {icon && <SlidersHorizontal size={14} aria-hidden />}
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        <option value="">{allLabel}</option>
        {options.map((option) => typeof option === "string"
          ? <option key={option} value={option}>{option}</option>
          : <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown size={13} aria-hidden />
    </label>
  );
});

export const DateControl = memo(function DateControl({ label, value, onChange, min, max }: {
  label: string; value: string; onChange: (value: string) => void; min?: string; max?: string;
}) {
  return (
    <label className={`date-control${value ? " is-set" : ""}`}>
      <span>{label}</span>
      <input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} aria-label={`${label} date`} />
    </label>
  );
});

/** Search + filters. On phones the filters fold behind a toggle so the results stay above the fold. */
export function TableToolbar({ search, children, activeCount, onClear }: { search: ReactNode; children: ReactNode; activeCount: number; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`table-toolbar${open ? " filters-open" : ""}`}>
      <div className="toolbar-search-row">
        {search}
        <button type="button" className={`filters-toggle${activeCount ? " is-set" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <SlidersHorizontal size={15} /> Filters{activeCount > 0 && <span className="filters-count">{activeCount}</span>}
        </button>
      </div>
      <div className="filter-controls">
        {children}
        {activeCount > 0 && <button type="button" className="clear-filters" onClick={onClear}><X size={13} /> Clear {activeCount}</button>}
      </div>
    </div>
  );
}
