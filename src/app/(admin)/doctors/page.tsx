import type { Metadata } from "next";
import { DoctorsView } from "@/components/doctors/doctors-view";

export const metadata: Metadata = { title: "Doctors | Doctor Tracker" };

export default function DoctorsPage() {
  return <DoctorsView />;
}
