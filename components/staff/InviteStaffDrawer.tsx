"use client";

import { useState } from "react";
import { X, UserRoundPlus, Mail, User, BriefcaseMedical } from "lucide-react";
import { inviteStaff } from "@/app/actions/staff";
import { useAppStore } from "@/lib/store";

type InviteStaffDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function InviteStaffDrawer({ isOpen, onClose, onSuccess }: InviteStaffDrawerProps) {
  const { notify } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("RECEPTIONIST");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await inviteStaff(formData);
      if (res.success) {
        notify(res.message || "Staff invited successfully.");
        onSuccess();
        onClose();
      } else {
        notify(`Error: ${res.error}`);
      }
    } catch (err: any) {
      notify(`Failed to invite staff: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="drawer-layer">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <h2>Invite Staff Member</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
              Add a new user to the clinic system.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <form id="invite-staff-form" className="form-layout" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input type="text" name="firstName" required placeholder="Madhukar" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input type="text" name="lastName" required placeholder="Smith" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input type="email" name="email" required placeholder="madhukar.takpire@clinic.com" />
              </div>
              <p className="field-hint">They will use this email to log in.</p>
            </div>

            <div className="form-group">
              <label>System Role</label>
              <select name="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="CLINIC_ADMIN">Clinic Admin</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="LAB_TECHNICIAN">Lab Assistant</option>
                <option value="PHARMACIST">Pharmacist</option>
              </select>
            </div>

            {role === "DOCTOR" && (
              <div className="form-group" style={{ animation: "slideDown 0.3s ease" }}>
                <label>Specialization</label>
                <div className="input-with-icon">
                  <BriefcaseMedical size={16} />
                  <input type="text" name="specialty" placeholder="e.g. Cardiologist, General Physician" required />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="drawer-footer">
          <button className="button button-secondary" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </button>
          <button className="button button-primary" type="submit" form="invite-staff-form" disabled={isSubmitting}>
            {isSubmitting ? "Inviting..." : <><UserRoundPlus size={16} /> Send Invitation</>}
          </button>
        </div>
      </div>
    </div>
  );
}
