import {
  BarChart3,
  BriefcaseMedical,
  CalendarDays,
  CircleDollarSign,
  History,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { getPatients, getPatientCount } from "@/app/actions/patients";
import { getAppointments, getTodayAppointmentCount } from "@/app/actions/appointments";
import { getActiveTreatmentCount } from "@/app/actions/treatments";
import { getFollowUpCounts } from "@/app/actions/follow-ups";
import { MetricCard } from "@/components/ui/MetricCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

export default async function DashboardPage() {
  const [patients, appointments, patientCount, appointmentCount, treatmentCount, followUpCounts] =
    await Promise.all([
      getPatients(),
      getAppointments(),
      getPatientCount(),
      getTodayAppointmentCount(),
      getActiveTreatmentCount(),
      getFollowUpCounts(),
    ]);

  const recentPatients = patients.slice(0, 4);

  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div>
          <span className="kicker">WELCOME BACK</span>
          <h2>Your clinic is running smoothly today.</h2>
          <p>
            {appointmentCount} appointment{appointmentCount !== 1 ? "s" : ""} scheduled,
            with {followUpCounts.overdue + followUpCounts.dueToday} follow-up{followUpCounts.overdue + followUpCounts.dueToday !== 1 ? "s" : ""} needing attention.
          </p>
        </div>
        <div className="quick-actions">
          <Link className="button button-secondary" href="/appointments">
            <CalendarDays size={17} /> New appointment
          </Link>
          <Link className="button button-primary" href="/patients">
            <UserRoundPlus size={17} /> Register patient
          </Link>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard
          icon={UsersRound}
          label="Total patients"
          value={patientCount.toLocaleString("en-IN")}
          note="All time"
          tone="blue"
        />
        <MetricCard
          icon={CalendarDays}
          label="Today's appointments"
          value={String(appointmentCount)}
          note={`${appointments.length} loaded`}
          tone="violet"
        />
        <MetricCard
          icon={BriefcaseMedical}
          label="Active treatments"
          value={String(treatmentCount)}
          note="Last 30 days"
          tone="green"
        />
        <MetricCard
          icon={History}
          label="Follow-ups due"
          value={String(followUpCounts.overdue + followUpCounts.dueToday)}
          note={`${followUpCounts.overdue} overdue`}
          tone="red"
        />
      </div>

      <DashboardCharts
        appointments={appointments}
        recentPatients={recentPatients}
        totalPatients={patientCount}
      />
    </div>
  );
}
