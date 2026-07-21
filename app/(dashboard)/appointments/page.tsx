import { Sparkles } from "lucide-react";
import { getAppointments } from "@/app/actions/appointments";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { AppointmentSchedule } from "@/components/appointments/AppointmentSchedule";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function AppointmentsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const appointments = await getAppointments();

  const today = new Date();
  const dayName = today.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-IN", { day: "numeric", month: "long" });

  return (
    <div className="page-stack">
      <PageHeader
        title="Today's clinical schedule"
        description="Coordinate doctors, rooms, and patient arrival status from one live view."
      />
      <div className="schedule-grid">
        <Panel className="calendar-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">{dayName.toUpperCase()}, {dateStr.toUpperCase()}</span>
              <h3>Today&apos;s schedule</h3>
            </div>
            <span className="count-pill">{appointments.length} appointments</span>
          </div>
          <AppointmentSchedule appointments={appointments} />
        </Panel>
        <aside className="page-stack">
          <Panel className="insight-card">
            <span className="card-icon">
              <Sparkles size={20} />
            </span>
            <span className="panel-kicker">OPTIMIZATION INSIGHT</span>
            <h3>Thursday mornings are fully booked</h3>
            <p>
              Consider opening two evening slots to accommodate five pending
              patient requests.
            </p>
            <button className="button button-light button-full">
              Review requests
            </button>
          </Panel>
          <Panel className="efficiency-card">
            <div className="progress-ring">
              <strong>94%</strong>
              <span>attendance</span>
            </div>
            <h3>Schedule efficiency</h3>
            <p>Confirmed attendance is 6% above the clinic average.</p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
