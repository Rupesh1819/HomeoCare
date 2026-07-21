"use client";

import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function AddPatientButton() {
  const setAddingPatient = useAppStore((s) => s.setAddingPatient);

  return (
    <button
      className="button button-primary"
      onClick={() => setAddingPatient(true)}
    >
      <Plus size={17} /> Add patient
    </button>
  );
}
