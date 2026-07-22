"use client";

import { useState, useEffect } from "react";
import { Download, FileCheck2, HeartPulse, MessageCircleMore, Plus, Printer, Trash, FlaskConical, Tag } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { createPrescription } from "@/app/actions/prescriptions";
import { getLabTests } from "@/app/actions/lab";
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

type PrescribedLabTest = {
  labTestId: string;
  testName: string;
  category: string;
  price: number;
  notes: string;
};

type LabTestOption = {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
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

  // Medicines state
  const [items, setItems] = useState<MedicineItem[]>([
    { medicine: "Natrum Muriaticum", potency: "200C", dosage: "4 pills, once daily" },
  ]);

  const [newMedicine, setNewMedicine] = useState("");
  const [newPotency, setNewPotency] = useState("200C");
  const [newDosage, setNewDosage] = useState("4 pills, once daily");

  // Lab Tests state
  const [availableLabTests, setAvailableLabTests] = useState<LabTestOption[]>([]);
  const [selectedLabTests, setSelectedLabTests] = useState<PrescribedLabTest[]>([]);
  const [chosenLabTestId, setChosenLabTestId] = useState("");
  const [labTestNotes, setLabTestNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLabTests()
      .then((tests: any[]) => setAvailableLabTests(tests.filter((t: any) => t.active)))
      .catch(console.error);
  }, []);

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

  const addLabTestItem = () => {
    if (!chosenLabTestId) {
      notify("Please select a lab test.");
      return;
    }
    const found = availableLabTests.find((t) => t.id === chosenLabTestId);
    if (!found) return;

    if (selectedLabTests.some((t) => t.labTestId === chosenLabTestId)) {
      notify("Test is already added to prescription.");
      return;
    }

    setSelectedLabTests([
      ...selectedLabTests,
      {
        labTestId: found.id,
        testName: found.name,
        category: found.category,
        price: found.price,
        notes: labTestNotes,
      },
    ]);
    setChosenLabTestId("");
    setLabTestNotes("");
  };

  const removeLabTestItem = (index: number) => {
    setSelectedLabTests(selectedLabTests.filter((_, i) => i !== index));
  };

  const totalLabFee = selectedLabTests.reduce((sum, t) => sum + t.price, 0);

  const handleSave = async () => {
    if (!selectedPatientId) {
      notify("Please select a patient.");
      return;
    }
    if (items.length === 0 && selectedLabTests.length === 0) {
      notify("Please add at least one medicine or lab test.");
      return;
    }

    setSaving(true);
    try {
      await createPrescription({
        patientId: selectedPatientId,
        diagnosis,
        items,
        labTests: selectedLabTests.map((t) => ({
          labTestId: t.labTestId,
          notes: t.notes,
        })),
        instructions,
        followUpDate: followUpDate || undefined,
      });
      notify("Prescription & Lab Orders saved successfully!");
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

          {/* Section 03: Prescribe Lab Tests */}
          <div className="form-section-title" style={{ marginTop: "1.5rem" }}>
            <span>03</span>
            <div>
              <h3>Prescribe Lab Tests</h3>
              <p>Diagnostic orders for Lab Assistant</p>
            </div>
          </div>

          {selectedLabTests.map((t, idx) => (
            <div
              key={idx}
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
                <strong>{t.testName}</strong> ({t.category}) — ₹{t.price}
                {t.notes && <small style={{ display: "block", color: "#d97706" }}>Note: {t.notes}</small>}
              </div>
              <button
                className="icon-button"
                onClick={() => removeLabTestItem(idx)}
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
              marginTop: "8px",
            }}
          >
            <h4>Add Lab Test</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              <label>
                Select Test
                <select
                  value={chosenLabTestId}
                  onChange={(e) => setChosenLabTestId(e.target.value)}
                >
                  <option value="">-- Choose Diagnostic Test --</option>
                  {availableLabTests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} ({test.category}) — ₹{test.price}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Test Notes / Instructions (Optional)
                <input
                  placeholder="e.g. Fasting sample required / Morning sample / Urgent"
                  value={labTestNotes}
                  onChange={(e) => setLabTestNotes(e.target.value)}
                />
              </label>

              <button
                type="button"
                className="button button-secondary"
                onClick={addLabTestItem}
                style={{ alignSelf: "flex-end", marginTop: "4px" }}
              >
                <Plus size={16} /> Add Lab Test
              </button>
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: "1.5rem" }}>
            <span>04</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src="/logo.png" alt="Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>भगवती क्लिनिक</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>होमियोपॅथीक व अ‍ॅलोपॅथीक ॲडव्हान्स केअर सेंटर</p>
                  </div>
                </div>
              </div>
              <div className="doctor-meta" style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>डॉ. मधुकर तकपिरे</strong>
                <small style={{ display: 'block', color: '#475569', fontSize: '0.78rem' }}>M.D. (Home), C.C.M.P.</small>
                <small style={{ display: 'block', color: '#475569', fontSize: '0.78rem' }}>शा. वै. महा. ओ. वाद. (घाटी)</small>
                <small style={{ display: 'block', color: '#0284c7', fontWeight: 600, fontSize: '0.78rem' }}>रेजि. नं. २५७०५</small>
              </div>
            </header>

            <div className="patient-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', margin: '12px 0' }}>
              <div><strong>रुग्णाचे नाव:</strong> {selectedPatient ? selectedPatient.name : "—"}</div>
              <div><strong>वय / लिंग:</strong> {selectedPatient ? `${selectedPatient.age} Y / ${selectedPatient.gender}` : "—"}</div>
              <div><strong>दिनांक:</strong> {new Date(consultationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
              <div><strong>रुग्ण आयडी:</strong> {selectedPatient ? selectedPatient.id : "—"}</div>
              <div><strong>निदान (Diagnosis):</strong> {diagnosis || "—"}</div>
            </div>

            <section className="rx-body" style={{ minHeight: 200 }}>
              <div className="rx-symbol" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginBottom: 8 }}>Rx</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '6px 0' }}>औषध (Medicine)</th>
                    <th style={{ padding: '6px 0' }}>पोटन्सी</th>
                    <th style={{ padding: '6px 0' }}>मात्रा (Dosage)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>{item.medicine}</td>
                      <td style={{ padding: '8px 0' }}>{item.potency}</td>
                      <td style={{ padding: '8px 0' }}>{item.dosage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedLabTests.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px dashed #cbd5e1" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0284c7", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <FlaskConical size={14} /> Prescribed Diagnostic Tests (लॅब चाचण्या)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82rem", color: "#334155" }}>
                    {selectedLabTests.map((t, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        <strong>{t.testName}</strong> ({t.category})
                        {t.notes && <span style={{ color: "#d97706" }}> — {t.notes}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {instructions && (
                <div style={{ marginTop: 20, fontSize: "0.8rem", color: "#475569", background: "#f8fafc", padding: 10, borderRadius: 6 }}>
                  <strong>सूचना (Instructions):</strong> {instructions}
                </div>
              )}
            </section>

            <footer style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                तपासणी वेळ: सकाळी ९ ते १, संध्याकाळी ५ ते ९<br />
                पत्ता: पांगरी रोड, नवगाव, ता. पैठण
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: 40 }} />
                <div style={{ borderTop: '1px solid #64748b', width: 140, paddingTop: 4, fontSize: '0.78rem', fontWeight: 600 }}>डॉक्टरांची स्वाक्षरी</div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
