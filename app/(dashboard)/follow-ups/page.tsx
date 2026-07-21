import { AlertCircle, CalendarDays, Check, Clock3, Send } from "lucide-react";
import { getFollowUps, getFollowUpCounts } from "@/app/actions/follow-ups";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { FollowUpBoard } from "@/components/follow-ups/FollowUpBoard";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function FollowUpsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const [data, counts] = await Promise.all([getFollowUps(), getFollowUpCounts()]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Care continuity board"
        description="Prioritize due, missed, and upcoming follow-ups before patients fall through the cracks."
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={AlertCircle} label="Overdue" value={String(counts.overdue)} note="Needs action now" tone="red" />
        <MetricCard icon={Clock3} label="Due today" value={String(counts.dueToday)} note={`${data.dueToday.length} remaining`} tone="amber" />
        <MetricCard icon={CalendarDays} label="Due tomorrow" value={String(counts.dueTomorrow)} note="Reminders queued" tone="blue" />
        <MetricCard icon={Check} label="Completion rate" value={counts.completionRate} note="All time" tone="green" />
      </div>
      <FollowUpBoard overdue={data.overdue} dueToday={data.dueToday} upcoming={data.upcoming} />
    </div>
  );
}
