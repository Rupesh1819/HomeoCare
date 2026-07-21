import { getClinicSettings, getAdminProfile } from "@/app/actions/settings";
import { SettingsClient } from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const settings = await getClinicSettings();

  return <SettingsClient initialSettings={settings} initialProfile={profile} />;
}
