"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Download,
  ShieldCheck,
  Sparkles,
  Trash2,
  FlaskConical,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { deletePatient } from "@/app/actions/patients";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Vital } from "@/components/ui/Vital";
import { Timeline } from "@/components/ui/Timeline";
import { getSecureReportUrl } from "@/app/actions/upload";
import { EditPatientDrawer } from "@/components/patients/EditPatientDrawer";
import { AddTreatmentDrawer } from "@/components/patients/AddTreatmentDrawer";
import AddVitalsDrawer from "@/components/patients/AddVitalsDrawer";

type PatientData = {
  id: string;
  dbId: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  mobile: string;
  email: string;
  condition: string;
  lastVisit: string;
  nextFollowUp: string;
  status: string;
  color: string;
  address: string;
  city: string;
  state: string;
  chiefComplaint: string;
  disease: string;
  allergyHistory: string;
  familyHistory: string;
  treatments: {
    id: string;
    date: string;
    symptoms: string;
    diagnosis: string;
    medicine: string;
    potency: string;
    dosage: string;
  }[];
  appointments: {
    id: string;
    date: string;
    time: string;
    status: string;
    reason: string;
    doctorName: string;
  }[];
  followUps: {
    id: string;
    dueAt: string;
    status: string;
    notes: string;
  }[];
  medicalReports?: {
    id: string;
    title: string;
    category: string;
    date: string;
    type: string;
    url: string | null;
    storagePath?: string;
  }[];
  labOrders?: {
    id: string;
    testName: string;
    category: string;
    price: number;
    doctorName: string;
    status: string;
    notes: string;
    reportUrl: string | null;
    reportStoragePath: string | null;
    orderedAt: string;
    completedAt: string | null;
  }[];
  latestVitals?: {
    bp: string | null;
    heartRate: number | null;
    weight: number | null;
    temperature: number | null;
    recordedAt: string;
  } | null;
};

export function PatientProfile({ patient }: { patient: PatientData }) {
  const { notify } = useAppStore();
  const router = useRouter();
  const [editingPatient, setEditingPatient] = useState(false);
  const [addingTreatment, setAddingTreatment] = useState(false);
  const [addingVitals, setAddingVitals] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tab, setTab] = useState("Overview");
  const tabs = [
    "Overview",
    "Treatments",
    "Appointments",
    "Prescriptions",
    "Lab Orders & Reports",
    "Medical Reports",
    "Billing",
    "Timeline",
  ];

  return (
    <div className="page-stack">

      <AddVitalsDrawer
        isOpen={addingVitals}
        onClose={() => setAddingVitals(false)}
        patientId={patient.dbId}
        onSuccess={() => {
          setAddingVitals(false);
          router.refresh();
        }}
      />

      <AddTreatmentDrawer
        isOpen={addingTreatment}
        onClose={() => setAddingTreatment(false)}
        onSuccess={() => {
          // Trigger a re-render by refreshing the router
          router.refresh();
        }}
        patientId={patient.dbId}
        patientName={patient.name}
      />

      <div className="profile-topline">
        <Link className="button button-ghost" href="/patients">
          <ArrowLeft size={17} /> Back to patients
        </Link>
        <div>
          <button
            className="button button-secondary"
            onClick={() => setEditingPatient(true)}
          >
            <Pencil size={16} /> Edit record
          </button>
          <button
            className="button button-secondary"
            style={{ color: "var(--red-600)", borderColor: "var(--red-200)" }}
            disabled={isDeleting}
            onClick={async () => {
              if (confirm(`Are you sure you want to delete ${patient.name}? This will hide them from the active patients list.`)) {
                setIsDeleting(true);
                try {
                  await deletePatient(patient.dbId);
                  notify("Patient successfully deleted.");
                  router.push("/patients");
                } catch (err: any) {
                  notify(`Failed to delete: ${err.message || err}`);
                  setIsDeleting(false);
                }
              }
            }}
          >
            <Trash2 size={16} /> {isDeleting ? "Deleting..." : "Delete patient"}
          </button>
        </div>
      </div>
      <Panel className="profile-hero">
        <div className="profile-identity">
          <span
            className="profile-avatar"
            style={{ background: patient.color }}
          >
            {patient.initials}
          </span>
          <div>
            <span className="kicker">PATIENT RECORD</span>
            <h2>{patient.name}</h2>
            <p>
              {patient.id} · {patient.age} years · {patient.gender}
            </p>
          </div>
        </div>
        <div className="profile-facts">
          <span>
            <Phone size={17} />
            <small>CONTACT</small>
            <strong>{patient.mobile}</strong>
          </span>
          <span>
            <CalendarDays size={17} />
            <small>LAST VISIT</small>
            <strong>{patient.lastVisit}</strong>
          </span>
          <span>
            <Activity size={17} />
            <small>STATUS</small>
            <StatusBadge status={patient.status} />
          </span>
        </div>
        <button
          className="button button-primary"
          onClick={() => notify("Follow-up appointment created.")}
        >
          <CalendarDays size={17} /> Schedule follow-up
        </button>
      </Panel>

      <div className="profile-tabs">
        {tabs.map((item) => (
          <button
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="profile-grid">
          <div className="page-stack">
            <Panel>
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">CLINICAL NOTE</span>
                  <h3>Clinical summary</h3>
                </div>
                <FileCheck2 size={20} />
              </div>
              <p className="clinical-summary">
                {patient.chiefComplaint ||
                  "No clinical notes recorded yet. Add a treatment to generate clinical summary."}
              </p>
              <div className="clinical-tags">
                {patient.allergyHistory && patient.allergyHistory !== "None known" ? (
                  <span>
                    <AlertCircle size={14} /> Allergies: {patient.allergyHistory}
                  </span>
                ) : (
                  <span>
                    <ShieldCheck size={14} /> No known allergies
                  </span>
                )}
                <span>
                  <Check size={14} /> Active patient
                </span>
                <span>
                  <Sparkles size={14} /> Database verified
                </span>
              </div>
            </Panel>
            <Panel>
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">VITALS</span>
                  <h3>Latest observations</h3>
                </div>
                <button className="text-button" onClick={() => setAddingVitals(true)}>
                  <Plus size={14} /> Add vitals
                </button>
              </div>
              <div className="vitals-grid">
                <Vital label="Blood pressure" value={patient.latestVitals?.bp || "--"} unit="mmHg" />
                <Vital label="Heart rate" value={patient.latestVitals?.heartRate?.toString() || "--"} unit="bpm" />
                <Vital label="Weight" value={patient.latestVitals?.weight?.toString() || "--"} unit="kg" />
                <Vital label="Temperature" value={patient.latestVitals?.temperature?.toString() || "--"} unit="°F" />
              </div>
            </Panel>
            <Panel>
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">HISTORY</span>
                  <h3>Recent timeline</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="text-button"
                    onClick={() => setAddingTreatment(true)}
                  >
                    <Plus size={14} /> Add treatment
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setTab("Timeline")}
                  >
                    Full timeline
                  </button>
                </div>
              </div>
              <Timeline />
            </Panel>
          </div>
          <aside className="page-stack">
            <Panel className="condition-card">
              <span className="card-icon card-icon-red">
                <AlertCircle size={20} />
              </span>
              <span className="panel-kicker">PRIMARY CONDITION</span>
              <h3>{patient.condition}</h3>
              <button className="text-button">
                View diagnosis <ChevronRight size={15} />
              </button>
            </Panel>
            <Panel className="followup-card">
              <span className="card-icon">
                <CalendarDays size={20} />
              </span>
              <span className="panel-kicker">NEXT FOLLOW-UP</span>
              <h3>{patient.nextFollowUp}</h3>
              <button className="button button-primary button-full">
                Manage appointment
              </button>
            </Panel>
            <Panel>
              <div className="panel-heading">
                <h3>Contact information</h3>
                <Pencil size={17} />
              </div>
              <div className="contact-list">
                <span>
                  <Phone size={16} />
                  <div>
                    <small>Mobile</small>
                    <strong>{patient.mobile}</strong>
                  </div>
                </span>
                <span>
                  <Mail size={16} />
                  <div>
                    <small>Email</small>
                    <strong>{patient.email || "Not provided"}</strong>
                  </div>
                </span>
              </div>
            </Panel>
          </aside>
        </div>
      ) : tab === "Treatments" ? (
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">TREATMENT HISTORY</span>
              <h3>All treatments ({patient.treatments.length})</h3>
            </div>
            <button className="button button-primary" onClick={() => setAddingTreatment(true)}>
              <Plus size={16} /> Add treatment
            </button>
          </div>
          {patient.treatments.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Diagnosis</th>
                  <th>Medicine</th>
                  <th>Potency</th>
                  <th>Dosage</th>
                </tr>
              </thead>
              <tbody>
                {patient.treatments.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.symptoms}</td>
                    <td>{t.diagnosis}</td>
                    <td>{t.medicine}</td>
                    <td>{t.potency}</td>
                    <td>{t.dosage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="empty-state" style={{ padding: "40px", textAlign: "center", background: "var(--surface-raised)", borderRadius: "8px" }}>
              <Activity size={32} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <h3>No treatments yet</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>
                This patient doesn't have any clinical treatments logged.
              </p>
            </div>
          )}
        </Panel>
      ) : tab === "Appointments" && patient.appointments.length > 0 ? (
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">APPOINTMENT HISTORY</span>
              <h3>All appointments ({patient.appointments.length})</h3>
            </div>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patient.appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>{a.doctorName}</td>
                    <td>{a.reason || "—"}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : tab === "Lab Orders & Reports" ? (
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">DIAGNOSTICS</span>
              <h3>Prescribed Lab Tests ({patient.labOrders?.length || 0})</h3>
            </div>
            <Link href="/lab-dashboard" className="button button-secondary">
              <FlaskConical size={16} /> Open Lab Dashboard
            </Link>
          </div>
          {patient.labOrders && patient.labOrders.length > 0 ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ordered Date</th>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Prescribed By</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th style={{ textAlign: "right" }}>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.labOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderedAt}</td>
                      <td>
                        <strong>{order.testName}</strong>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                          {order.category}
                        </span>
                      </td>
                      <td>{order.doctorName}</td>
                      <td>
                        {order.status === "PENDING" && (
                          <span className="badge" style={{ background: "#fff7ed", color: "#c2410c" }}>
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        {order.status === "IN_PROGRESS" && (
                          <span className="badge" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                            <Play size={12} /> In Progress
                          </span>
                        )}
                        {order.status === "COMPLETED" && (
                          <span className="badge" style={{ background: "#ecfdf5", color: "#047857" }}>
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {order.notes || "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {order.status === "COMPLETED" ? (
                          order.reportUrl && order.reportUrl !== "#" ? (
                            <a
                              href={order.reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button button-secondary button-sm"
                            >
                              <Search size={14} /> View Report
                            </a>
                          ) : order.reportStoragePath ? (
                            <button
                              className="button button-secondary button-sm"
                              onClick={async () => {
                                const res = await getSecureReportUrl(order.reportStoragePath!);
                                if (res.success && res.url) window.open(res.url, "_blank");
                                else notify(res.error || "Failed to open report");
                              }}
                            >
                              <Search size={14} /> View Report
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Done</span>
                          )
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Awaiting results</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "40px", textAlign: "center", background: "var(--surface-raised)", borderRadius: "8px" }}>
              <FlaskConical size={32} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <h3>No Lab Orders</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>
                No lab tests have been prescribed for this patient yet.
              </p>
            </div>
          )}
        </Panel>
      ) : tab === "Medical Reports" && patient.medicalReports && patient.medicalReports.length > 0 ? (
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">DOCUMENTS</span>
              <h3>Medical Reports ({patient.medicalReports.length})</h3>
            </div>
            <Link href="/reports" className="button button-secondary">Go to documents center</Link>
          </div>
          <div className="document-grid">
            {patient.medicalReports.map((file) => (
              <article className="document-card" key={file.id}>
                <div className="document-preview">
                  <FileText size={34} />
                  <span>{file.type.split("/").pop() || "FILE"}</span>
                </div>
                <div className="document-info">
                  <span className="panel-kicker">{file.category}</span>
                  <h3>{file.title}</h3>
                  <p>
                    {patient.name} · {file.date}
                  </p>
                </div>
                <div className="document-actions">
                  <button
                    className="icon-button"
                    onClick={async () => {
                      if (file.url && file.url !== "#") {
                        window.open(file.url, "_blank");
                      } else if (file.storagePath) {
                        const res = await getSecureReportUrl(file.storagePath);
                        if (res.success && res.url) window.open(res.url, "_blank");
                        else notify(res.error || "Preview failed");
                      } else {
                        notify(`${file.title} opened in secure preview.`);
                      }
                    }}
                    title="Preview"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={async () => {
                      if (file.url && file.url !== "#") {
                        window.open(file.url, "_blank");
                      } else if (file.storagePath) {
                        const res = await getSecureReportUrl(file.storagePath, true);
                        if (res.success && res.url) window.open(res.url, "_blank");
                        else notify(res.error || "Download failed");
                      } else {
                        notify(`${file.title} downloaded.`);
                      }
                    }}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button className="icon-button" title="More">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      ) : (
        <Panel className="tab-placeholder">
          <span className="card-icon">
            <ClipboardCheck size={22} />
          </span>
          <h3>{tab}</h3>
          <p>
            {patient.name}&apos;s {tab.toLowerCase()} records will appear here.
          </p>
          <button
            className="button button-primary"
            onClick={() =>
              notify(`New ${tab.toLowerCase()} entry started.`)
            }
          >
            <Plus size={16} /> Add{" "}
            {tab === "Timeline" ? "event" : tab.slice(0, -1)}
          </button>
        </Panel>
      )}

      {editingPatient && (
        <EditPatientDrawer
          patient={patient}
          onClose={() => setEditingPatient(false)}
        />
      )}
    </div>
  );
}
