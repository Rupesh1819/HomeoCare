"use client";

import { type FormEvent } from "react";
import { ChevronRight, Download, FileCheck2, Search, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { createTreatment } from "@/app/actions/treatments";

type TreatmentData = {
  id: string;
  date: string;
  patient: string;
  diagnosis: string;
  medicine: string;
  followup: string;
};

type PatientOption = { name: string; id: string };

export function TreatmentForm({
  history,
  patients,
}: {
  history: TreatmentData[];
  patients: PatientOption[];
}) {
  const { notify } = useAppStore();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createTreatment({
        patientName: String(form.get("patient") || ""),
        symptoms: String(form.get("symptoms") || ""),
        diagnosis: String(form.get("diagnosis") || ""),
        medicine: String(form.get("medicine") || ""),
        potency: String(form.get("potency") || "30C"),
        dosage: String(form.get("dosage") || ""),
        duration: String(form.get("duration") || ""),
        doctorNotes: String(form.get("notes") || ""),
        followUpDate: String(form.get("followup") || ""),
      });
      event.currentTarget.reset();
      notify("Treatment record saved to the immutable clinical history.");
      window.location.reload();
    } catch (err: any) {
      notify(err.message || "Failed to save treatment.");
    }
  };

  return (
    <>
      <div className="treatment-grid">
        <Panel>
          <form className="clinical-form" onSubmit={submit}>
            <div className="form-section-title">
              <span>01</span>
              <div>
                <h3>Consultation details</h3>
                <p>Core clinical context</p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Patient
                <select name="patient" required defaultValue="">
                  <option value="" disabled>Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label>Consultation date<input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></label>
            </div>
            <label>Symptoms<textarea name="symptoms" placeholder="Describe presenting symptoms, modalities, and duration..." /></label>
            <div className="form-grid">
              <label>Clinical observations<textarea placeholder="Vitals, appearance, temperament..." /></label>
              <label>Diagnosis<input name="diagnosis" placeholder="Primary assessment" required /></label>
            </div>
            <div className="form-section-title">
              <span>02</span>
              <div>
                <h3>Homeopathic prescription</h3>
                <p>Medicine and dosage</p>
              </div>
            </div>
            <div className="form-grid form-grid-4">
              <label>Medicine<input name="medicine" placeholder="Medicine name" required /></label>
              <label>Potency<select name="potency"><option>30C</option><option>200C</option><option>1M</option><option>6X</option></select></label>
              <label>Dosage<input name="dosage" placeholder="4 pills" /></label>
              <label>Duration<input name="duration" placeholder="14 days" /></label>
            </div>
            <label>Doctor notes<textarea name="notes" placeholder="Clinical rationale and patient instructions..." /></label>
            <div className="form-grid">
              <label>Follow-up date<input name="followup" type="date" /></label>
              <label>Reminder channel<select><option>WhatsApp + SMS</option><option>WhatsApp only</option><option>SMS only</option></select></label>
            </div>
            <div className="form-footer">
              <span><ShieldCheck size={16} /> Treatment history is audit-protected.</span>
              <button className="button button-primary" type="submit"><FileCheck2 size={17} /> Save treatment</button>
            </div>
          </form>
        </Panel>
        <aside className="page-stack">
          <Panel className="patient-context-card">
            <div className="panel-heading"><h3>Patient context</h3><Search size={17} /></div>
            <div className="empty-context"><UserRound size={24} /><strong>Select a patient</strong><span>Recent history and allergies will appear here.</span></div>
          </Panel>
          <Panel className="ai-note">
            <Sparkles size={20} />
            <h3>Clinical completeness</h3>
            <p>Document modalities, causation, and mental generals before finalizing the remedy.</p>
          </Panel>
        </aside>
      </div>
      <Panel>
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">IMMUTABLE HISTORY</span>
            <h3>Recent treatment records</h3>
          </div>
          <button className="button button-secondary"><Download size={16} /> Export</button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Medicine</th><th>Follow-up</th><th /></tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td><strong>{item.patient}</strong></td>
                  <td>{item.diagnosis}</td>
                  <td>{item.medicine}</td>
                  <td>{item.followup}</td>
                  <td><button className="icon-button"><ChevronRight size={16} /></button></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>No treatment records yet. Save your first consultation above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
