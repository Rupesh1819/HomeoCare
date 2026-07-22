import { AlertCircle, BarChart3, CircleDollarSign, Clock3 } from "lucide-react";
import { getInvoices, getBillingStats } from "@/app/actions/billing";
import { getPatients } from "@/app/actions/patients";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const [invoices, stats, patients] = await Promise.all([
    getInvoices(),
    getBillingStats(),
    getPatients(),
  ]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Revenue &amp; Billing Center"
        description="Manage consultation &amp; lab invoices, collect payments, track outstanding balances, and export financial receipts."
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={CircleDollarSign} label="Revenue today" value={stats.todayRevenue} note="From invoices" tone="green" />
        <MetricCard icon={BarChart3} label="This month" value={stats.monthRevenue} note="Total billed" tone="blue" />
        <MetricCard icon={Clock3} label="Pending payments" value={stats.pendingTotal} note={`${stats.pendingCount} invoices`} tone="amber" />
        <MetricCard icon={AlertCircle} label="Overdue" value={stats.overdueTotal} note={`${stats.overdueCount} accounts`} tone="red" />
      </div>
      <InvoiceTable invoices={invoices} patients={patients} />
    </div>
  );
}
