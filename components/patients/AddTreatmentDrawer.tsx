"use client";

import { X, Activity } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { addTreatment } from "@/app/actions/patients";

type AddTreatmentDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: string;
  patientName: string;
};

export function AddTreatmentDrawer({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  patientName,
}: AddTreatmentDrawerProps) {
  const { notify } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicine, setMedicine] = useState("");
  const [potency, setPotency] = useState("30 CH");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await addTreatment(patientId, {
        symptoms,
        diagnosis,
        medicine,
        potency,
        dosage,
        duration,
        doctorNotes,
      });

      if (res.success) {
        notify("Treatment added successfully.");
        
        // Reset form
        setSymptoms("");
        setDiagnosis("");
        setMedicine("");
        setPotency("30 CH");
        setDosage("");
        setDuration("");
        setDoctorNotes("");
        
        onSuccess();
        onClose();
      } else {
        notify("Failed to add treatment.");
      }
    } catch (err: any) {
      notify(`Error: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-layer">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <h2>Add Clinical Treatment</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
              Patient: {patientName}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <form id="add-treatment-form" className="form-layout" onSubmit={handleSubmit}>
            
            <div className="form-section">
              <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px", letterSpacing: "0.5px" }}>Clinical Assessment</h4>
              
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Presenting Symptoms *</label>
                <div className="input-with-icon">
                  <Activity size={16} style={{ alignSelf: "flex-start", marginTop: "12px" }} />
                  <textarea 
                    required 
                    value={symptoms} 
                    onChange={e => setSymptoms(e.target.value)} 
                    placeholder="e.g. Chronic headache, fatigue, joint pain..."
                    style={{ minHeight: "80px" }}
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Diagnosis *</label>
                <input 
                  type="text" 
                  required 
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)} 
                  placeholder="e.g. Migraine, Rheumatoid Arthritis..."
                />
              </div>
            </div>

            <div className="form-section" style={{ marginTop: "24px" }}>
              <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px", letterSpacing: "0.5px" }}>Prescription</h4>
              
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Medicine prescribed *</label>
                <input 
                  type="text" 
                  required 
                  value={medicine} 
                  onChange={e => setMedicine(e.target.value)} 
                  placeholder="e.g. Belladonna, Rhus Tox..."
                />
              </div>

              <div className="form-group">
                <label>Potency</label>
                <select value={potency} onChange={e => setPotency(e.target.value)}>
                  <option value="6 CH">6 CH</option>
                  <option value="30 CH">30 CH</option>
                  <option value="200 CH">200 CH</option>
                  <option value="1M">1M</option>
                  <option value="10M">10M</option>
                  <option value="Q (Mother Tincture)">Q (Mother Tincture)</option>
                  <option value="3X">3X</option>
                  <option value="6X">6X</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dosage *</label>
                <input 
                  type="text" 
                  required 
                  value={dosage} 
                  onChange={e => setDosage(e.target.value)} 
                  placeholder="e.g. 4 pills TDS, 10 drops BD"
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input 
                  type="text" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  placeholder="e.g. 15 days, 1 month"
                />
              </div>
            </div>

            <div className="form-section" style={{ marginTop: "24px" }}>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Doctor's Private Notes</label>
                <textarea 
                  value={doctorNotes} 
                  onChange={e => setDoctorNotes(e.target.value)} 
                  placeholder="Internal notes not printed on prescription..."
                  style={{ minHeight: "60px" }}
                />
              </div>
            </div>

          </form>
        </div>

        <div className="drawer-footer">
          <button className="button button-secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="button button-primary" type="submit" form="add-treatment-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save treatment"}
          </button>
        </div>
      </div>
    </div>
  );
}
