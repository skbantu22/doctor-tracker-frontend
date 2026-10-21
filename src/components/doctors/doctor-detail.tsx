"use client";

import { useParams } from "next/navigation";
import { DoctorDetailView } from "./doctor-detail-view";

export function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  return <DoctorDetailView key={id} id={id} />;
}
