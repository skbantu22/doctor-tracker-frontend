"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getErrorMessage } from "@/lib/api";

export function Modal({ kicker, title, onClose, children, size = "md" }: { kicker: string; title: string; onClose: () => void; children: ReactNode; size?: "sm" | "md" }) {
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Runs once per open: parents pass inline callbacks, and re-running would steal focus mid-typing.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input, select, button[type=submit]")?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className={`record-modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div><span className="panel-kicker">{kicker}</span><h2 id="modal-title">{title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className={`form-field${error ? " has-error" : ""}`}><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: {
  title: string; message: ReactNode; confirmLabel: string; onConfirm: () => Promise<unknown>; onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setPending(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
      setPending(false);
    }
  }

  return (
    <Modal kicker="PLEASE CONFIRM" title={title} onClose={onClose} size="sm">
      <div className="confirm-body"><span className="confirm-icon"><AlertTriangle size={18} /></span><p>{message}</p></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions">
        <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="button-danger" onClick={confirm} disabled={pending}>{pending ? "Deleting…" : confirmLabel}</button>
      </div>
    </Modal>
  );
}
