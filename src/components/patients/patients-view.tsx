"use client";

import { Check, Plus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useDeletePatient, usePatientFilters, usePatients } from "@/lib/queries";
import { patientStatuses, type Patient } from "@/lib/types";
import { EmptyState, ErrorState, PageHeading } from "../ui/feedback";
import { ConfirmDialog } from "../ui/modal";
import { PaginationBar } from "../ui/pagination-bar";
import { DateControl, SearchField, SelectFilter, TableToolbar } from "../ui/table-controls";
import { useToast } from "../ui/toast";
import { PatientFormModal } from "./patient-form-modal";
import { PatientTable } from "./patient-table";

const FILTER_KEYS = ["search", "condition", "status", "doctor", "from", "to"] as const;
const PAGE_SIZE = 10;

export function PatientsView() {
  const { values, page, update, setPage, clear, activeCount } = useUrlFilters(FILTER_KEYS);
  const patients = usePatients({ ...values, page, limit: PAGE_SIZE });
  const filters = usePatientFilters();
  const deletePatient = useDeletePatient();
  const notify = useToast();
  const [editing, setEditing] = useState<Patient | "new" | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);

  const onEdit = useCallback((patient: Patient) => setEditing(patient), []);
  const onDelete = useCallback((patient: Patient) => setDeleting(patient), []);
  const filtered = Boolean(values.search || activeCount);
  const doctorOptions = filters.data?.doctors.map((doctor) => ({ value: doctor._id, label: doctor.name })) ?? [];

  return (
    <>
      <PageHeading
        kicker="CONNECTED CARE"
        title={<>Patients<span className="heading-period">.</span></>}
        description="Every person in your clinic, with their condition, doctor and care status."
        action={<button className="button-primary" onClick={() => setEditing("new")}><Plus size={17} /> Add patient</button>}
      />
      <section className="table-panel" aria-busy={patients.isFetching}>
        <TableToolbar
          activeCount={activeCount}
          onClear={clear}
          search={<SearchField value={values.search} onChange={(search) => update({ search })} placeholder="Search name, email, phone, condition…" label="Search patients" />}
        >
          <SelectFilter label="Filter by condition" icon value={values.condition} onChange={(condition) => update({ condition })} allLabel="All conditions" options={filters.data?.conditions ?? []} />
          <SelectFilter label="Filter by doctor" value={values.doctor} onChange={(doctor) => update({ doctor })} allLabel="All doctors" options={doctorOptions} />
          <SelectFilter label="Filter by status" value={values.status} onChange={(status) => update({ status })} allLabel="All statuses" options={patientStatuses} />
          <DateControl label="From" value={values.from} max={values.to || undefined} onChange={(from) => update({ from })} />
          <DateControl label="To" value={values.to} min={values.from || undefined} onChange={(to) => update({ to })} />
        </TableToolbar>
        {patients.isError ? <ErrorState message={patients.error.message} onRetry={() => patients.refetch()} /> : (
          <PatientTable
            patients={patients.data?.data}
            loading={patients.isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            empty={<EmptyState icon={<Users size={20} />} title="No patients found" detail={filtered ? "Try a different search or clear the filters." : "Add a patient to start tracking care."} action={filtered ? <button className="button-secondary" onClick={clear}>Clear filters</button> : <button className="button-secondary" onClick={() => setEditing("new")}><Plus size={15} /> Add patient</button>} />}
          />
        )}
        <PaginationBar pagination={patients.data?.pagination} onPage={setPage} label="patients" fetching={patients.isFetching} />
      </section>
      <div className="under-table-note"><span><Check size={14} /> Patient information is only visible to signed-in admins.</span><span>{patients.data?.pagination.total ?? 0} records</span></div>

      {editing && <PatientFormModal patient={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete patient?"
          message={<>This permanently removes <strong>{deleting.name}</strong> and their record. This can&apos;t be undone.</>}
          confirmLabel="Delete patient"
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await deletePatient.mutateAsync({ id: deleting._id });
            notify("Patient removed.");
            if (patients.data?.data.length === 1 && page > 1) setPage(page - 1);
          }}
        />
      )}
    </>
  );
}
