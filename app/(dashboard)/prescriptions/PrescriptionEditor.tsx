"use client";

import { useState } from "react";
import { Download, FileCheck2, HeartPulse, MessageCircleMore, Plus, Printer, Trash } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { createPrescription } from "@/app/actions/prescriptions";
import { useRouter } from "next/navigation";
import { downloadPrescriptionPDF } from "@/lib/pdf";

type Patient = {
  dbId: string;
  id: string; // patientNumber
  name: string;
  age: number;
  gender: string;
};

type MedicineItem = {
  medicine: string;
  potency: string;
  dosage: string;
};

export function PrescriptionEditor({ patients }: { patients: Patient[] }) {
  const { notify } = useAppStore();
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("Chronic Migraine");
  const [consultationDate, setConsultationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [instructions, setInstructions] = useState(
    "Take on an empty stomach. Avoid coffee, mint, and strong fragrances during the course."
  );
  const [followUpDate, setFollowUpDate] = useState("");

  const [items, setItems] = useState<MedicineItem[]>([
    { medicine: "Natrum Muriaticum", potency: "200C", dosage: "4 pills, once daily" },
  ]);

  const [newMedicine, setNewMedicine] = useState("");
  const [newPotency, setNewPotency] = useState("200C");
  const [newDosage, setNewDosage] = useState("4 pills, once daily");
  const [saving, setSaving] = useState(false);

  const selectedPatient = patients.find((p) => p.dbId === selectedPatientId);

  const addMedicineItem = () => {
    if (!newMedicine) {
      notify("Please enter a medicine name.");
      return;
    }
    setItems([...items, { medicine: newMedicine, potency: newPotency, dosage: newDosage }]);
    setNewMedicine("");
  };

  const removeMedicineItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      notify("Please select a patient.");
      return;
    }
    if (items.length === 0) {
      notify("Please add at least one medicine.");
      return;
    }

    setSaving(true);
    try {
      await createPrescription({
        patientId: selectedPatientId,
        diagnosis,
        items,
        instructions,
        followUpDate: followUpDate || undefined,
      });
      notify("Prescription saved successfully!");
      router.refresh();
    } catch (err: any) {
      notify(`Failed to save: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Prescription generator"
        description="Create a professional, secure prescription ready for print or patient delivery."
        action={
          <button className="button button-primary" onClick={handleSave} disabled={saving}>
            <FileCheck2 size={17} /> {saving ? "Saving..." : "Save prescription"}
          </button>
        }
      />
      <div className="prescription-layout">
        <Panel className="prescription-editor">
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h3>Patient &amp; consultation</h3>
              <p>Prescription context</p>
            </div>
          </div>
          <label>
            Patient
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.dbId} value={p.dbId}>
                  {p.name} · {p.id}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Consultation date
              <input
                type="date"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
              />
            </label>
            <label>
              Diagnosis
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </label>
          </div>

          <div className="form-section-title">
            <span>02</span>
            <div>
              <h3>Medicine list</h3>
              <p>Current remedies added</p>
            </div>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "var(--panel-bg)",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            >
              <div>
                <strong>{item.medicine}</strong> ({item.potency}) — <small>{item.dosage}</small>
              </div>
              <button
                className="icon-button"
                onClick={() => removeMedicineItem(index)}
                style={{ color: "var(--red-600)" }}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}

          <div
            style={{
              padding: "16px",
              border: "1px dashed var(--line)",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            <h4>Add Medicine</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              <label>
                Medicine name
                <input
                  placeholder="e.g. Sulphur"
                  value={newMedicine}
                  onChange={(e) => setNewMedicine(e.target.value)}
                />
              </label>
              <div className="form-grid">
                <label>
                  Potency
                  <select value={newPotency} onChange={(e) => setNewPotency(e.target.value)}>
                    <option>30C</option>
                    <option>200C</option>
                    <option>1M</option>
                    <option>10M</option>
                    <option>LM1</option>
                    <option>LM2</option>
                    <option>Mother Tincture (Q)</option>
                  </select>
                </label>
                <label>
                  Dosage
                  <input
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 4 pills, once daily"
                  />
                </label>
              </div>
              <button
                type="button"
                className="button button-secondary"
                onClick={addMedicineItem}
                style={{ alignSelf: "flex-end", marginTop: "8px" }}
              >
                <Plus size={16} /> Add to list
              </button>
            </div>
          </div>

          <div className="form-section-title">
            <span>03</span>
            <div>
              <h3>General Instructions</h3>
              <p>Dietary restrictions and follow up</p>
            </div>
          </div>
          <label>
            Instructions
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </label>
          <label>
            Follow-up date
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </label>
        </Panel>

        <div className="prescription-preview-wrap">
          <div className="prescription-actions">
            <span>Live preview</span>
            <button className="button button-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                if (!selectedPatient) { notify("Select a patient first."); return; }
                downloadPrescriptionPDF({
                  clinicName: "Bhagavati Clinic",
                  branchName: "Navgaon Clinic",
                  doctorName: "Dr. Madhukar Takpire",
                  doctorDegrees: [
                    "M.D. (Home), C.C.M.P.",
                    "शा. वै. महा. ओ. वाद. (घाटी)",
                    "जनरल फिजिशियन अँड सर्जन"
                  ],
                  doctorReg: "25705",
                  clinicPhone: "+91 9404981492",
                  patientName: selectedPatient.name,
                  patientAge: selectedPatient.age,
                  patientGender: selectedPatient.gender,
                  patientId: selectedPatient.id,
                  date: new Date(consultationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
                  diagnosis,
                  items,
                  instructions,
                  followUpDate: followUpDate ? new Date(followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "",
                });
                notify("Prescription PDF downloaded!");
              }}
            >
              <Download size={16} /> PDF
            </button>
            <button
              className="button button-whatsapp"
              onClick={() => notify("Prescription queued for WhatsApp delivery.")}
            >
              <MessageCircleMore size={16} /> WhatsApp
            </button>
          </div>
          <article className="prescription-paper">
            <header>
              <div className="brand-lockup">
                <span className="brand-mark" style={{ background: 'transparent', padding: 0 }}>
                  <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                </span>
                <div>
                  <strong>Bhagavati Clinic</strong>
                  <small>Navgaon Clinic</small>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong>Dr. Madhukar Takpire</strong>
                <small style={{ fontSize: '11px', color: 'var(--muted)' }}>M.D. (Home), C.C.M.P.</small>
                <small style={{ fontSize: '11px', color: 'var(--muted)' }}>शा. वै. महा. ओ. वाद. (घाटी)</small>
                <small style={{ fontSize: '11px', color: 'var(--muted)' }}>जनरल फिजिशियन अँड सर्जन</small>
                <span style={{ marginTop: '2px' }}>Reg No. 25705 · +91 9404981492</span>
              </div>
            </header>
            <div className="rx-patient">
              <div>
                <span>PATIENT</span>
                <strong>{selectedPatient ? selectedPatient.name : "Select a patient"}</strong>
                <small>
                  {selectedPatient
                    ? `${selectedPatient.age} years · ${selectedPatient.gender} · ${selectedPatient.id}`
                    : "No patient selected"}
                </small>
              </div>
              <div>
                <span>DATE</span>
                <strong>
                  {new Date(consultationDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <small>Diagnosis: {diagnosis || "Not specified"}</small>
              </div>
            </div>
            <div className="rx-symbol">Rx</div>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Potency</th>
                  <th>Dosage</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#888" }}>
                      No remedies added to prescription.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.medicine}</strong>
                        <small>Homeopathic remedy</small>
                      </td>
                      <td>{item.potency}</td>
                      <td>{item.dosage}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <section>
              <span>INSTRUCTIONS</span>
              <p>{instructions || "No instructions provided."}</p>
            </section>
            <section>
              <span>NEXT FOLLOW-UP</span>
              <p>
                <strong>
                  {followUpDate
                    ? new Date(followUpDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not scheduled"}
                </strong>
              </p>
            </section>
            <footer>
              <div>
                <span>Digitally verified prescription</span>
                <small>Generated by Bhagavati Clinic Management System</small>
              </div>
              <div className="signature">
                <strong>Dr. Madhukar Takpire</strong>
                <span>Authorized signature</span>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
