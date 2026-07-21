"use client";

import { create } from "zustand";
import {
  patients as initialPatients,
  appointments as initialAppointments,
  type Patient,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/data";

type AppState = {
  /* auth */
  authenticated: boolean;
  login: () => void;
  logout: () => void;

  /* appearance */
  darkMode: boolean;
  toggleTheme: () => void;
  language: string;
  cycleLanguage: () => void;
  setLanguage: (lang: string) => void;

  /* navigation */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  /* patients */
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  addingPatient: boolean;
  setAddingPatient: (open: boolean) => void;

  /* appointments */
  appointments: Appointment[];
  setAppointments: (fn: (current: Appointment[]) => Appointment[]) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addAppointment: (appointment: Appointment) => void;

  /* toast */
  toast: string;
  notify: (message: string) => void;
  clearToast: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  /* auth */
  authenticated: false,
  login: () => set({ authenticated: true }),
  logout: () => set({ authenticated: false }),

  /* appearance */
  darkMode: false,
  toggleTheme: () =>
    set((state) => {
      const next = !state.darkMode;
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = next ? "dark" : "light";
      }
      return { darkMode: next };
    }),
  language: "EN",
  cycleLanguage: () =>
    set((state) => ({
      language:
        state.language === "EN"
          ? "मराठी"
          : state.language === "मराठी"
            ? "हिंदी"
            : "EN",
    })),
  setLanguage: (language) => set({ language }),

  /* navigation */
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  /* patients */
  patients: initialPatients,
  addPatient: (patient) =>
    set((state) => ({
      patients: [patient, ...state.patients],
      addingPatient: false,
    })),
  addingPatient: false,
  setAddingPatient: (addingPatient) => set({ addingPatient }),

  /* appointments */
  appointments: initialAppointments,
  setAppointments: (fn) =>
    set((state) => ({ appointments: fn(state.appointments) })),
  updateAppointmentStatus: (id, status) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [...state.appointments, appointment],
    })),

  /* toast */
  toast: "",
  notify: (message) => set({ toast: message }),
  clearToast: () => set({ toast: "" }),
}));
