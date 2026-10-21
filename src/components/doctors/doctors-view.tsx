"use client";

import { Check, Plus, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDate } from "@/lib/format";
import { useDoctorFilters, useDoctors } from "@/lib/queries";
import { EmptyState, ErrorState, LoadingRows, PageHeading, PersonCell } from "../ui/feedback";
import { PaginationBar } from "../ui/pagination-bar";
import { DateControl, SearchField, SelectFilter, TableToolbar } from "../ui/table-controls";
import { DoctorFormModal } from "./doctor-form-modal";
import { PatientFormModal } from "../patients/patient-form-modal";
import type { Doctor } from "@/lib/types";

const FILTER_KEYS = ["search", "specialization", "hospital", "from", "to", "sort"] as const;
const PAGE_SIZE = 10;
const sortOptions = [{ value: "oldest", label: "Oldest first" }, { value: "name", label: "Name A–Z" }];

export function DoctorsView() {
  const { values, page, update, setPage, clear, activeCount } = useUrlFilters(FILTER_KEYS);
  const doctors = useDoctors({ ...values, page, limit: PAGE_SIZE });
  const filters = useDoctorFilters();
  const [adding, setAdding] = useState(false);
  const [addPatientFor, setAddPatientFor] = useState<Doctor | null>(null);
  const filtered = Boolean(values.search || activeCount);
  const rows = doctors.data?.data;

  return (
    <>
      <PageHeading
        kicker="YOUR CARE TEAM"
        title={<>Doctors<span className="heading-period">.</span></>}
        description="Manage providers and keep patient care connected."
        action={<button className="button-primary" onClick={() => setAdding(true)}><Plus size={17} /> Add doctor</button>}
      />
      <section className="table-panel" aria-busy={doctors.isFetching}>
        <TableToolbar
          activeCount={activeCount}
          onClear={clear}
          search={<SearchField value={values.search} onChange={(search) => update({ search })} placeholder="Search name, specialty, hospital…" label="Search doctors" />}
        >
          <SelectFilter label="Filter by specialty" icon value={values.specialization} onChange={(specialization) => update({ specialization })} allLabel="All specialties" options={filters.data?.specializations ?? []} />
          <SelectFilter label="Filter by hospital" value={values.hospital} onChange={(hospital) => update({ hospital })} allLabel="All hospitals" options={filters.data?.hospitals ?? []} />
          <DateControl label="From" value={values.from} max={values.to || undefined} onChange={(from) => update({ from })} />
          <DateControl label="To" value={values.to} min={values.from || undefined} onChange={(to) => update({ to })} />
          <SelectFilter label="Sort doctors" value={values.sort} onChange={(sort) => update({ sort })} allLabel="Newest first" options={sortOptions} />
        </TableToolbar>
        {doctors.isError ? <ErrorState message={doctors.error.message} onRetry={() => doctors.refetch()} /> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th scope="col">DOCTOR</th><th scope="col">SPECIALTY</th><th scope="col">HOSPITAL</th><th scope="col">PHONE</th><th scope="col">PATIENTS</th><th scope="col">ADDED</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {doctors.isLoading ? <LoadingRows columns={7} /> : rows?.map((doctor) => (
                  <tr key={doctor._id}>
                    <td data-label="Doctor"><PersonCell name={doctor.name} detail={doctor.email} href={`/doctors/${doctor._id}`} /></td>
                    <td data-label="Specialty"><span className="specialty-pill">{doctor.specialization}</span></td>
                    <td data-label="Hospital"><span className="hospital-cell">{doctor.hospital}</span></td>
                    <td data-label="Phone"><span className="date-cell">{doctor.phone}</span></td>
                    <td data-label="Patients"><Link className="patient-count-link" href={`/doctors/${doctor._id}`}>{doctor.patientCount ?? 0}<span> patients</span></Link></td>
                    <td data-label="Added"><span className="date-cell">{formatDate(doctor.createdAt)}</span></td>
                    <td>
                      <div className="row-actions">
                        <Link className="icon-button small" href={`/doctors/${doctor._id}`} title="View patients" aria-label={`View ${doctor.name}'s patients`}><Users size={15} /></Link>
                        <button className="icon-button small" onClick={() => setAddPatientFor(doctor)} title="Add patient" aria-label={`Add patient to ${doctor.name}`}><Plus size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!doctors.isLoading && rows?.length === 0 && (
              <EmptyState icon={<Stethoscope size={20} />} title="No doctors found" detail={filtered ? "Try a different search or clear the filters." : "Add your first doctor to build your care team."} action={filtered ? <button className="button-secondary" onClick={clear}>Clear filters</button> : <button className="button-secondary" onClick={() => setAdding(true)}><Plus size={15} /> Add doctor</button>} />
            )}
          </div>
        )}
        <PaginationBar pagination={doctors.data?.pagination} onPage={setPage} label="doctors" fetching={doctors.isFetching} />
      </section>
      <div className="under-table-note"><span><Check size={14} /> Select a doctor to see and manage their patients.</span><span>{doctors.data?.pagination.total ?? 0} providers</span></div>

      {adding && <DoctorFormModal onClose={() => setAdding(false)} />}
      {addPatientFor && <PatientFormModal lockedDoctor={addPatientFor} onClose={() => setAddPatientFor(null)} />}
    </>
  );
}
