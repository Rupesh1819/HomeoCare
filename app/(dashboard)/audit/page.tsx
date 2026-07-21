import { getAuditLogs } from "@/app/actions/audit";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";
import { AuditClient } from "./AuditClient";

export default async function AuditPage() {
  const profile = await getAdminProfile();
  
  if (profile.role !== "CLINIC_ADMIN" && profile.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const logs = await getAuditLogs();

  return <AuditClient initialLogs={logs} />;
}
