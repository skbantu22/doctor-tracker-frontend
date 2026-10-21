"use client";

import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError, getErrorMessage } from "@/lib/api";
import { usePatientFilters, useSavePatient, type PatientInput } from "@/lib/queries";
import { patientStatuses, type DoctorSummary, type Patient } from "@/lib/types";
import { FormField, Modal } from "../ui/modal";
import { useToast } from "../ui/toast";

/** Create or edit a patient. Pass `lockedDoctor` when adding from a doctor's page. */
export function PatientFormModal({ patient, lockedDoctor, onClose }: { patient?: Patient; lockedDoctor?: DoctorSummary; onClose: () => void }) {
  const save = useSavePatient();
  const notify = useToast();
  const filters = usePatientFilters();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const currentDoctor = lockedDoctor?._id ?? (patient && typeof patient.doctor !== "string" ? patient.doctor._id : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget)) as PatientInput;
    if (lockedDoctor) data.doctor = lockedDoctor._id;
    try {
      await save.mutateAsync({ id: patient?._id, data });
      notify(patient ? "Patient information updated." : `${data.name} added to the care list.`);
      onClose();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      if (saveError instanceof ApiError && saveError.details) setFieldErrors(saveError.details);
    }
  }

  const fieldError = (key: keyof PatientInput) => fieldErrors[key]?.[0];

  return (
    <Modal kicker={lockedDoctor ? `PATIENT OF ${lockedDoctor.name.toUpperCase()}` : "PATIENT RECORD"} title={patient ? "Edit patient" : "Add a patient"} onClose={onClose}>
      <form className="record-form" onSubmit={submit}>
        <FormField label="Full name" error={fieldError("name")}><input name="name" defaultValue={patient?.name} placeholder="Patient name" required minLength={2} maxLength={100} autoComplete="off" /></FormField>
        <div className="form-split">
          <FormField label="Email" error={fieldError("email")}><input name="email" type="email" defaultValue={patient?.email} placeholder="patient@email.com" required /></FormField>
          <FormField label="Phone" error={fieldError("phone")}><input name="phone" type="tel" defaultValue={patient?.phone} placeholder="+880 1700-000000" required minLength={7} maxLength={30} /></FormField>
        </div>
        <FormField label="Condition" error={fieldError("condition")}>
          <input name="condition" defaultValue={patient?.condition} placeholder="e.g. Hypertension" required minLength={2} maxLength={100} list="condition-options" />
          <datalist id="condition-options">{filters.data?.conditions.map((condition) => <option key={condition} value={condition} />)}</datalist>
        </FormField>
        <div className="form-split">
          {lockedDoctor ? (
            <FormField label="Assigned doctor"><input value={lockedDoctor.name} readOnly disabled /></FormField>
          ) : (
            <FormField label="Assigned doctor" error={fieldError("doctor")}>
              {/* Remount once options arrive so the uncontrolled defaultValue selects the current doctor. */}
              <select key={filters.data ? "ready" : "loading"} name="doctor" defaultValue={currentDoctor} required disabled={filters.isLoading}>
                <option value="" disabled>{filters.isLoading ? "Loading doctors…" : "Select a doctor"}</option>
                {filters.data?.doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name} · {doctor.specialization}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="Care status"><select name="status" defaultValue={patient?.status ?? "Active"}>{patientStatuses.map((status) => <option key={status}>{status}</option>)}</select></FormField>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : patient ? "Save changes" : "Add patient"}{!save.isPending && <ArrowRight size={15} />}</button>
        </div>
      </form>
    </Modal>
  );
}
