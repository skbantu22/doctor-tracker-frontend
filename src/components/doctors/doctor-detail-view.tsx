"use client";

import { ArrowLeft, Building2, Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDate } from "@/lib/format";
import { useDeleteDoctor, useDeletePatient, useDoctor, useDoctorPatients } from "@/lib/queries";
import { patientStatuses, type Patient } from "@/lib/types";
import { Avatar, EmptyState, ErrorState, PageSkeleton } from "../ui/feedback";
import { ConfirmDialog } from "../ui/modal";
import { PaginationBar } from "../ui/pagination-bar";
import { SearchField, SelectFilter, TableToolbar } from "../ui/table-controls";
import { useToast } from "../ui/toast";
import { PatientFormModal } from "../patients/patient-form-modal";
import { PatientTable } from "../patients/patient-table";
import { DoctorFormModal } from "./doctor-form-modal";

const FILTER_KEYS = ["search", "status"] as const;

export function DoctorDetailView({ id }: { id: string }) {
  const router = useRouter();
  const notify = useToast();
  const doctor = useDoctor(id);
  const { values, page, update, setPage, clear, activeCount } = useUrlFilters(FILTER_KEYS);
  const patients = useDoctorPatients(id, { ...values, page, limit: 10 });
  const deletePatient = useDeletePatient();
  const deleteDoctor = useDeleteDoctor();
  const [modal, setModal] = useState<"add" | "edit-doctor" | "delete-doctor" | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const onEdit = useCallback((patient: Patient) => setEditing(patient), []);
  const onDelete = useCallback((patient: Patient) => setDeleting(patient), []);

  if (doctor.isLoading) return <PageSkeleton />;
  if (doctor.isError || !doctor.data) {
    return <ErrorState message={doctor.error?.message ?? "Doctor not found."} onRetry={() => doctor.refetch()} />;
  }
  const info = doctor.data;
  const filtered = Boolean(values.search || activeCount);

  return (
    <>
      <Link href="/doctors" className="back-link"><ArrowLeft size={14} /> All doctors</Link>
      <section className="doctor-hero">
        <div className="doctor-hero-main">
          <Avatar name={info.name} size="lg" />
          <div>
            <span className="specialty-pill">{info.specialization}</span>
            <h1>{info.name}</h1>
            <ul className="doctor-contact">
              <li><Building2 size={14} /> {info.hospital}</li>
              <li><Mail size={14} /> <a href={`mailto:${info.email}`}>{info.email}</a></li>
              <li><Phone size={14} /> <a href={`tel:${info.phone}`}>{info.phone}</a></li>
            </ul>
          </div>
        </div>
        <div className="doctor-hero-actions">
          <button className="button-secondary" onClick={() => setModal("edit-doctor")}><Pencil size={14} /> Edit</button>
          <button className="button-secondary danger-outline" onClick={() => setModal("delete-doctor")}><Trash2 size={14} /> Delete</button>
          <button className="button-primary" onClick={() => setModal("add")}><Plus size={16} /> Add patient</button>
        </div>
        <dl className="doctor-stats">
          <div><dt>Total patients</dt><dd>{info.patientCount}</dd></div>
          {patientStatuses.map((status) => <div key={status}><dt>{status}</dt><dd>{info.byStatus[status]}</dd></div>)}
          <div><dt>Joined</dt><dd className="stat-date">{formatDate(info.createdAt)}</dd></div>
        </dl>
      </section>

      <section className="table-panel" aria-busy={patients.isFetching}>
        <TableToolbar
          activeCount={activeCount}
          onClear={clear}
          search={<SearchField value={values.search} onChange={(search) => update({ search })} placeholder={`Search ${info.name.split(" ")[0]}'s patients…`} label="Search this doctor's patients" />}
        >
          <SelectFilter label="Filter by status" icon value={values.status} onChange={(status) => update({ status })} allLabel="All statuses" options={patientStatuses} />
        </TableToolbar>
        {patients.isError ? <ErrorState message={patients.error.message} onRetry={() => patients.refetch()} /> : (
          <PatientTable
            patients={patients.data?.data}
            loading={patients.isLoading}
            showDoctor={false}
            onEdit={onEdit}
            onDelete={onDelete}
            empty={<EmptyState icon={<Users size={20} />} title={filtered ? "No matching patients" : "No patients yet"} detail={filtered ? "Try a different search or status." : `Add ${info.name}'s first patient.`} action={filtered ? <button className="button-secondary" onClick={clear}>Clear filters</button> : <button className="button-secondary" onClick={() => setModal("add")}><Plus size={15} /> Add patient</button>} />}
          />
        )}
        <PaginationBar pagination={patients.data?.pagination} onPage={setPage} label="patients" fetching={patients.isFetching} />
      </section>

      {modal === "add" && <PatientFormModal lockedDoctor={info} onClose={() => setModal(null)} />}
      {modal === "edit-doctor" && <DoctorFormModal doctor={info} onClose={() => setModal(null)} />}
      {modal === "delete-doctor" && (
        <ConfirmDialog
          title="Delete doctor?"
          message={info.patientCount
            ? <><strong>{info.name}</strong> still has {info.patientCount} patients. Reassign or remove them first.</>
            : <>This permanently removes <strong>{info.name}</strong> from the directory.</>}
          confirmLabel="Delete doctor"
          onClose={() => setModal(null)}
          onConfirm={async () => {
            await deleteDoctor.mutateAsync(info._id);
            notify("Doctor removed from the directory.");
            router.replace("/doctors");
          }}
        />
      )}
      {editing && <PatientFormModal patient={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Remove patient?"
          message={<>This deletes <strong>{deleting.name}</strong> from {info.name}&apos;s patient list.</>}
          confirmLabel="Remove patient"
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await deletePatient.mutateAsync({ id: deleting._id, doctorId: info._id });
            notify("Patient removed.");
            if (patients.data?.data.length === 1 && page > 1) setPage(page - 1);
          }}
        />
      )}
    </>
  );
}
