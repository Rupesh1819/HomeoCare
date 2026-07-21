import { getAnalyticsData } from "@/app/actions/analytics";
import { AnalyticsClient } from "./AnalyticsClient";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const data = await getAnalyticsData();

  return <AnalyticsClient data={data} />;
}
