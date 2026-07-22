"use client";

import { useState } from "react";
import { X, Activity } from "lucide-react";
import { addVitals } from "@/app/actions/vitals";
import { useAppStore } from "@/lib/store";
type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
};

export default function AddVitalsDrawer({ isOpen, onClose, patientId, onSuccess }: Props) {
  const { notify } = useAppStore();
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.append("patientId", patientId);

    const res = await addVitals(formData);
    setIsPending(false);

    if (res.success) {
      notify("Vitals recorded successfully");
      onSuccess();
    } else {
      setErrorMsg(res.error || "Something went wrong.");
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2>Record Vitals</h2>
            <p>Add the latest observations for this patient.</p>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {errorMsg && (
            <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <form id="vitals-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Blood Pressure (mmHg)</label>
              <div className="input-with-icon">
                <Activity size={16} />
                <input type="text" name="bp" placeholder="e.g. 120/80" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Heart Rate (bpm)</label>
                <input type="number" name="heartRate" placeholder="e.g. 75" />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" step="0.1" name="weight" placeholder="e.g. 68.5" />
              </div>
            </div>

            <div className="form-group">
              <label>Temperature (°F)</label>
              <input type="number" step="0.1" name="temperature" placeholder="e.g. 98.6" />
            </div>
          </form>
        </div>

        <div className="drawer-footer">
          <button className="btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-primary" type="submit" form="vitals-form" disabled={isPending}>
            {isPending ? "Saving..." : "Save Vitals"}
          </button>
        </div>
      </div>
    </div>
  );
}
