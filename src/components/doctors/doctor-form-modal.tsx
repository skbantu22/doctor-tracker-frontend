"use client";

import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError, getErrorMessage } from "@/lib/api";
import { useSaveDoctor, type DoctorInput } from "@/lib/queries";
import type { Doctor } from "@/lib/types";
import { FormField, Modal } from "../ui/modal";
import { useToast } from "../ui/toast";

export function DoctorFormModal({ doctor, onClose, onSaved }: { doctor?: Doctor; onClose: () => void; onSaved?: (doctor: Doctor) => void }) {
  const save = useSaveDoctor();
  const notify = useToast();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget)) as DoctorInput;
    try {
      const result = await save.mutateAsync({ id: doctor?._id, data });
      notify(doctor ? "Doctor details updated." : `${data.name} added to the directory.`);
      onSaved?.(result.data);
      onClose();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      if (saveError instanceof ApiError && saveError.details) setFieldErrors(saveError.details);
    }
  }

  const fieldError = (key: keyof DoctorInput) => fieldErrors[key]?.[0];

  return (
    <Modal kicker="CARE TEAM" title={doctor ? "Edit doctor" : "Add a doctor"} onClose={onClose}>
      <form className="record-form" onSubmit={submit} noValidate={false}>
        <FormField label="Full name" error={fieldError("name")}><input name="name" defaultValue={doctor?.name} placeholder="Dr. Amara Rahman" required minLength={2} maxLength={100} autoComplete="off" /></FormField>
        <div className="form-split">
          <FormField label="Specialization" error={fieldError("specialization")}><input name="specialization" defaultValue={doctor?.specialization} placeholder="Cardiology" required minLength={2} maxLength={80} /></FormField>
          <FormField label="Hospital" error={fieldError("hospital")}><input name="hospital" defaultValue={doctor?.hospital} placeholder="Northview Medical Center" required minLength={2} maxLength={120} /></FormField>
        </div>
        <div className="form-split">
          <FormField label="Phone" error={fieldError("phone")}><input name="phone" type="tel" defaultValue={doctor?.phone} placeholder="+880 1700-000000" required minLength={7} maxLength={30} /></FormField>
          <FormField label="Email" error={fieldError("email")}><input name="email" type="email" defaultValue={doctor?.email} placeholder="doctor@clinic.com" required /></FormField>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : doctor ? "Save changes" : "Add doctor"}{!save.isPending && <ArrowRight size={15} />}</button>
        </div>
      </form>
    </Modal>
  );
}
