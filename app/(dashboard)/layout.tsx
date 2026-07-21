import { ReactNode } from "react";
import { getClinicSettings } from "@/app/actions/settings";
import DashboardClientLayout from "./DashboardClientLayout";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const settings = await getClinicSettings();
  
  return (
    <DashboardClientLayout settings={settings}>
      {children}
    </DashboardClientLayout>
  );
}
