import { getStaff } from "@/app/actions/staff";
import { StaffClient } from "./StaffClient";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function StaffPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const data = await getStaff();

  return <StaffClient data={data} />;
}
