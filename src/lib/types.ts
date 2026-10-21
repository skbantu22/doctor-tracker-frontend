export type Pagination = { page: number; limit: number; total: number; pages: number };

export const patientStatuses = ["Active", "Follow-up", "Recovered"] as const;
export type PatientStatus = (typeof patientStatuses)[number];

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
};

export type DoctorDetail = Doctor & { patientCount: number; byStatus: Record<PatientStatus, number> };

export type DoctorSummary = Pick<Doctor, "_id" | "name" | "specialization">;

export type Patient = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  condition: string;
  status: PatientStatus;
  doctor: Pick<Doctor, "_id" | "name" | "specialization" | "hospital"> | string;
  createdAt: string;
};

export type NamedCount = { name: string; count: number };

export type DashboardData = {
  months: number;
  doctorCount: number;
  patientCount: number;
  newPatients: number;
  averagePerDoctor: number;
  byStatus: Record<PatientStatus, number>;
  monthly: { month: string; patients: number; doctors: number }[];
  patientsByDoctor: (NamedCount & { id: string; specialization: string })[];
  conditions: NamedCount[];
  specializations: NamedCount[];
};

export type Insight = { title: string; detail: string; tone: "positive" | "neutral" | "attention" };
export type InsightsData = { insights: Insight[]; model: string; generatedAt: string };

export type ApiPage<T> = { data: T[]; pagination: Pagination };
export type ApiItem<T> = { data: T };
export type Session = { admin: { email: string } };
