"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Sparkles,
  Video,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { createAppointment, updateAppointmentStatus as updateStatus } from "@/app/actions/appointments";

type AppointmentData = {
  id: string;
  dbId: string;
  patient: string;
  doctor: string;
  time: string;
  mode: string;
  status: string;
  reason: string;
};

export function AppointmentSchedule({ appointments: initial }: { appointments: AppointmentData[] }) {
  const { notify } = useAppStore();
  const [appointments, setAppointments] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("Week");

  const handleComplete = async (id: string, status: string) => {
    const newStatus = status === "Waiting" ? "Checked in" : "Completed";
    try {
      await updateStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      notify(`Appointment marked ${newStatus.toLowerCase()}.`);
    } catch {
      notify("Failed to update appointment.");
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await createAppointment({
        patientName: String(data.get("patient") || "New patient"),
        time: String(data.get("time") || "05:00 PM"),
        reason: String(data.get("reason") || "Consultation"),
      });
      setShowForm(false);
      notify("Appointment scheduled and confirmation queued.");
      // Page will revalidate automatically
      window.location.reload();
    } catch (err: any) {
      notify(err.message || "Failed to create appointment.");
    }
  };

  return (
    <>
      <div className="calendar-toolbar">
        <div>
          <button className="icon-button">
            <ChevronRight className="rotate-180" size={17} />
          </button>
          <strong>
            {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </strong>
          <button className="icon-button">
            <ChevronRight size={17} />
          </button>
        </div>
        <div className="segmented-control">
          {["Day", "Week", "Month"].map((item) => (
            <button
              className={mode === item ? "active" : ""}
              onClick={() => setMode(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-list">
        {appointments.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No appointments scheduled for today.
          </div>
        )}
        {appointments.map((appointment) => (
          <div
            className={`schedule-card status-${appointment.status.toLowerCase().replace(" ", "-")}`}
            key={appointment.id}
          >
            <div className="schedule-time">
              <strong>{appointment.time}</strong>
              <span>
                {appointment.mode === "Video" ? (
                  <Video size={15} />
                ) : (
                  <Building2 size={15} />
                )}
                {appointment.mode}
              </span>
            </div>
            <span className="avatar">
              {appointment.patient
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="schedule-copy">
              <div>
                <strong>{appointment.patient}</strong>
                <StatusBadge status={appointment.status} />
              </div>
              <span>
                {appointment.reason} · {appointment.doctor}
              </span>
            </div>
            <div className="schedule-actions">
              {appointment.status !== "Completed" && (
                <button
                  className="button button-small button-primary"
                  onClick={() => handleComplete(appointment.id, appointment.status)}
                >
                  {appointment.status === "Waiting" ? "Check in" : "Complete"}
                </button>
              )}
              <button
                className="button button-small button-secondary"
                onClick={async () => {
                  await updateStatus(appointment.id, "Reschedule");
                  setAppointments((prev) =>
                    prev.map((a) => (a.id === appointment.id ? { ...a, status: "Reschedule" } : a))
                  );
                  notify("Appointment rescheduled.");
                }}
              >
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="button button-primary"
        style={{ marginTop: "1rem" }}
        onClick={() => setShowForm(true)}
      >
        <Plus size={17} /> Add appointment
      </button>

      {showForm && (
        <Modal title="Create appointment" onClose={() => setShowForm(false)}>
          <form className="form-stack" onSubmit={handleAdd}>
            <label>
              Patient name
              <input name="patient" placeholder="Search or enter patient" required />
            </label>
            <div className="form-grid">
              <label>
                Date
                <input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </label>
              <label>
                Time
                <select name="time" defaultValue="05:00 PM">
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                  <option>04:00 PM</option>
                  <option>05:00 PM</option>
                  <option>05:30 PM</option>
                  <option>06:00 PM</option>
                </select>
              </label>
            </div>
            <label>
              Reason for visit
              <input name="reason" placeholder="e.g. Migraine follow-up" />
            </label>
            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                Schedule &amp; notify
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
