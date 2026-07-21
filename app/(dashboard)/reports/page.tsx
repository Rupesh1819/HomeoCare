import { getReports } from "@/app/actions/upload";
import { getPatients } from "@/app/actions/patients";
import { ReportsClient } from "./ReportsClient";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "PHARMACIST") {
    redirect("/");
  }

  const [reports, patients] = await Promise.all([
    getReports(),
    getPatients(),
  ]);

  return <ReportsClient initialReports={reports} patients={patients} />;
}
