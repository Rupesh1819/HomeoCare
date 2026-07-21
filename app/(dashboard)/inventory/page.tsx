import { AlertCircle, Box, Clock3, Pill, Plus } from "lucide-react";
import { getInventory, getInventoryStats } from "@/app/actions/inventory";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN") {
    redirect("/");
  }

  const [items, stats] = await Promise.all([getInventory(), getInventoryStats()]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Medicine inventory"
        description="Track batches, stock movement, expiry, and purchase history across branches."
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={Pill} label="Total medicines" value={String(stats.totalMedicines)} note={`${stats.totalUnits} units`} tone="blue" />
        <MetricCard icon={AlertCircle} label="Low stock" value={String(stats.lowStock)} note="Reorder recommended" tone="red" />
        <MetricCard icon={Clock3} label="Expiring soon" value={String(stats.expiringSoon)} note="Within 90 days" tone="amber" />
        <MetricCard icon={Box} label="Stock value" value={stats.stockValue} note="All branches" tone="green" />
      </div>
      <InventoryTable items={items} />
    </div>
  );
}
