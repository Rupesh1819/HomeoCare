"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AddPatientDrawer } from "@/components/patients/AddPatientDrawer";
import { usePathname } from "next/navigation";

const pageMeta: Record<string, { title: string; eyebrow: string }> = {
  "/": { title: "Practice Health", eyebrow: "Friday, 12 June 2026" },
  "/patients": { title: "Patient Management", eyebrow: "Clinical records" },
  "/appointments": {
    title: "Appointment Center",
    eyebrow: "Schedule and availability",
  },
  "/treatments": {
    title: "Treatment Management",
    eyebrow: "Consultation records",
  },
  "/prescriptions": {
    title: "Prescription Studio",
    eyebrow: "Clinical documentation",
  },
  "/reports": { title: "Medical Reports", eyebrow: "Secure document center" },
  "/billing": { title: "Billing & Revenue", eyebrow: "Invoices and payments" },
  "/inventory": {
    title: "Medicine Inventory",
    eyebrow: "Stock and expiry tracking",
  },
  "/analytics": {
    title: "Clinic Analytics",
    eyebrow: "Performance intelligence",
  },
  "/follow-ups": {
    title: "Follow-Up Center",
    eyebrow: "Continuity of care",
  },
  "/whatsapp": {
    title: "WhatsApp Center",
    eyebrow: "Patient communication",
  },
  "/staff": { title: "Staff Management", eyebrow: "Roles and access" },
  "/settings": { title: "Clinic Settings", eyebrow: "Configuration" },
};

export default function DashboardClientLayout({
  children,
  settings,
}: {
  children: ReactNode;
  settings: any;
}) {
  const pathname = usePathname();
  const {
    sidebarOpen,
    setSidebarOpen,
    addingPatient,
    toast,
    clearToast,
  } = useAppStore();

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => clearToast(), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast, clearToast]);

  const meta = pageMeta[pathname] || { title: "HomeoCare Pro", eyebrow: "" };

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        settings={settings}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          // Temporarily handle client logout by clearing cookies and reloading
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          window.location.href = "/login";
        }}
      />

      <main className="main-shell">
        <Topbar title={meta.title} eyebrow={meta.eyebrow} />

        <div className="content-shell">{children}</div>
      </main>

      <BottomNav />

      {addingPatient && <AddPatientDrawer />}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon">
            <Check size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
