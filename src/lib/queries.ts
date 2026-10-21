"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "./api";
import type { ApiItem, ApiPage, DashboardData, Doctor, DoctorDetail, DoctorSummary, InsightsData, Patient, Session } from "./types";

type Params = Record<string, string | number | undefined>;

/** Centralised query keys: invalidating a prefix (e.g. ["patients"]) refreshes every page/filter variant. */
export const queryKeys = {
  session: ["session"] as const,
  dashboard: (months: number) => ["dashboard", months] as const,
  insights: (months: number) => ["dashboard", "insights", months] as const,
  doctors: (params: Params) => ["doctors", "list", params] as const,
  doctor: (id: string) => ["doctors", "detail", id] as const,
  doctorFilters: ["doctors", "filters"] as const,
  doctorPatients: (id: string, params: Params) => ["patients", "by-doctor", id, params] as const,
  patients: (params: Params) => ["patients", "list", params] as const,
  patientFilters: ["patients", "filters"] as const,
};

export function useSession() {
  return useQuery({ queryKey: queryKeys.session, queryFn: () => api<Session>("/auth/me"), retry: false, staleTime: 5 * 60_000 });
}

export function useDashboard(months: number) {
  return useQuery({
    queryKey: queryKeys.dashboard(months),
    queryFn: () => api<ApiItem<DashboardData>>(`/dashboard/overview?months=${months}`).then((result) => result.data),
    placeholderData: keepPreviousData,
  });
}

/** AI insights are optional: no retries, and a 503 (not configured) simply hides the card. */
export function useInsights(months: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.insights(months),
    queryFn: () => api<ApiItem<InsightsData>>(`/dashboard/insights?months=${months}`).then((result) => result.data),
    enabled,
    retry: false,
    staleTime: 10 * 60_000,
  });
}

export function useDoctors(params: Params) {
  return useQuery({
    queryKey: queryKeys.doctors(params),
    queryFn: () => api<ApiPage<Doctor>>(`/doctors?${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({ queryKey: queryKeys.doctor(id), queryFn: () => api<ApiItem<DoctorDetail>>(`/doctors/${id}`).then((result) => result.data) });
}

export function useDoctorFilters() {
  return useQuery({
    queryKey: queryKeys.doctorFilters,
    queryFn: () => api<ApiItem<{ specializations: string[]; hospitals: string[] }>>("/doctors/filters").then((result) => result.data),
    staleTime: 5 * 60_000,
  });
}

export function useDoctorPatients(id: string, params: Params) {
  return useQuery({
    queryKey: queryKeys.doctorPatients(id, params),
    queryFn: () => api<ApiPage<Patient>>(`/doctors/${id}/patients?${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function usePatients(params: Params) {
  return useQuery({
    queryKey: queryKeys.patients(params),
    queryFn: () => api<ApiPage<Patient>>(`/patients?${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function usePatientFilters() {
  return useQuery({
    queryKey: queryKeys.patientFilters,
    queryFn: () => api<ApiItem<{ conditions: string[]; doctors: DoctorSummary[] }>>("/patients/filters").then((result) => result.data),
    staleTime: 5 * 60_000,
  });
}

/** Records feed several screens (lists, counts, charts), so writes invalidate every dependent query family. */
function useInvalidateRecords() {
  const queryClient = useQueryClient();
  return () => Promise.all(["doctors", "patients", "dashboard"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
}

export type DoctorInput = Pick<Doctor, "name" | "specialization" | "hospital" | "phone" | "email">;
export type PatientInput = Pick<Patient, "name" | "email" | "phone" | "condition" | "status"> & { doctor: string };

export function useSaveDoctor() {
  const invalidate = useInvalidateRecords();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: DoctorInput }) =>
      api<ApiItem<Doctor>>(id ? `/doctors/${id}` : "/doctors", { method: id ? "PATCH" : "POST", body: data }),
    onSuccess: invalidate,
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidateRecords();
  return useMutation({ mutationFn: (id: string) => api(`/doctors/${id}`, { method: "DELETE" }), onSuccess: invalidate });
}

export function useSavePatient() {
  const invalidate = useInvalidateRecords();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: PatientInput }) => id
      ? api<ApiItem<Patient>>(`/patients/${id}`, { method: "PATCH", body: data })
      : api<ApiItem<Patient>>(`/doctors/${data.doctor}/patients`, { method: "POST", body: data }),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidateRecords();
  return useMutation({
    mutationFn: ({ id, doctorId }: { id: string; doctorId?: string }) =>
      api(doctorId ? `/doctors/${doctorId}/patients/${id}` : `/patients/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
