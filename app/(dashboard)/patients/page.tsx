import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPatients } from "@/app/actions/patients";
import { PatientTable } from "@/components/patients/PatientTable";
import { AddPatientButton } from "./AddPatientButton";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function PatientsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  // Fetch real patients from the PostgreSQL database via Server Action
  const patients = await getPatients();

  return (
    <div className="page-stack">
      <PageHeader
        title="All patients"
        description="Search, review, and manage complete longitudinal patient records."
        action={<AddPatientButton />}
      />
      <PatientTable patients={patients} />
    </div>
  );
}
