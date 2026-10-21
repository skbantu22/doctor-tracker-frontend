"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { memo, type ReactNode } from "react";
import { formatDate } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { LoadingRows, PersonCell, StatusBadge } from "../ui/feedback";

type Props = {
  patients: Patient[] | undefined;
  loading: boolean;
  showDoctor?: boolean;
  empty: ReactNode;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
};

export const PatientTable = memo(function PatientTable({ patients, loading, showDoctor = true, empty, onEdit, onDelete }: Props) {
  const columns = showDoctor ? 6 : 5;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">PATIENT</th><th scope="col">CONDITION</th>{showDoctor && <th scope="col">DOCTOR</th>}<th scope="col">STATUS</th><th scope="col">ADDED</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {loading && !patients ? <LoadingRows columns={columns} /> : patients?.map((patient) => {
            const doctor = typeof patient.doctor === "string" ? null : patient.doctor;
            return (
              <tr key={patient._id}>
                <td data-label="Patient"><PersonCell name={patient.name} detail={patient.email} /></td>
                <td data-label="Condition"><span className="condition-cell"><span className="condition-mini" />{patient.condition}</span></td>
                {showDoctor && (
                  <td data-label="Doctor">
                    {doctor ? <Link href={`/doctors/${doctor._id}`} className="table-doctor">{doctor.name}</Link> : <span className="table-doctor">Unassigned</span>}
                    <small className="doctor-subline">{doctor?.specialization ?? "—"}</small>
                  </td>
                )}
                <td data-label="Status"><StatusBadge status={patient.status} /></td>
                <td data-label="Added"><span className="date-cell">{formatDate(patient.createdAt)}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button small" onClick={() => onEdit(patient)} title="Edit patient" aria-label={`Edit ${patient.name}`}><Pencil size={14} /></button>
                    <button className="icon-button small danger-action" onClick={() => onDelete(patient)} title="Delete patient" aria-label={`Delete ${patient.name}`}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!loading && patients?.length === 0 && empty}
    </div>
  );
});
