import { getPatients } from "@/app/actions/patients";
import { PrescriptionEditor } from "./PrescriptionEditor";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function PrescriptionsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN") {
    redirect("/");
  }

  const patients = await getPatients();

  return <PrescriptionEditor patients={patients} />;
}
