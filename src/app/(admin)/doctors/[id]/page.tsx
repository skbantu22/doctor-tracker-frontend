import type { Metadata } from "next";
import { DoctorDetail } from "@/components/doctors/doctor-detail";

export const metadata: Metadata = { title: "Doctor | Doctor Tracker" };

export default function DoctorPage() {
  return <DoctorDetail />;
}
