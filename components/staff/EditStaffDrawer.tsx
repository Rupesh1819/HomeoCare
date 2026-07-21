"use client";

import { useState, useEffect } from "react";
import { X, Mail, User, BriefcaseMedical, Phone } from "lucide-react";
import { updateStaff } from "@/app/actions/staff";
import { useAppStore } from "@/lib/store";

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  name: string;
  role: string;
  rawRole: string;
  specialty: string;
  registrationNo: string;
  status: string;
  initials: string;
};

type EditStaffDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staff: StaffMember | null;
};

export function EditStaffDrawer({ isOpen, onClose, onSuccess, staff }: EditStaffDrawerProps) {
  const { notify } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("RECEPTIONIST");
  const [specialty, setSpecialty] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  useEffect(() => {
    if (staff && isOpen) {
      setFirstName(staff.firstName);
      setLastName(staff.lastName);
      setMobile(staff.mobile || "");
      setRole(staff.rawRole);
      setSpecialty(staff.specialty === "Staff Member" ? "" : staff.specialty);
      setRegistrationNo(staff.registrationNo || "");
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await updateStaff({
        id: staff!.id,
        firstName,
        lastName,
        mobile,
        role,
        specialization: specialty,
        registrationNo,
      });
      if (res.success) {
        notify("Staff member updated successfully.");
        onSuccess();
        onClose();
      } else {
        notify(`Error: ${res.error}`);
      }
    } catch (err: any) {
      notify(`Failed to update staff: ${err.message || err}`);
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
            <h2>Edit Staff Member</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
              Update {staff.name}'s details
            </p>
          </div>
          <button className="icon-button" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <form id="edit-staff-form" className="form-layout" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon" style={{ opacity: 0.6 }}>
                <Mail size={16} />
                <input type="email" value={staff.email} disabled />
              </div>
              <p className="field-hint">Email address cannot be changed for security.</p>
            </div>

            <div className="form-group">
              <label>System Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="CLINIC_ADMIN">Clinic Admin</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="LAB_TECHNICIAN">Lab Assistant</option>
                <option value="PHARMACIST">Pharmacist</option>
              </select>
            </div>

            {role === "DOCTOR" && (
              <>
                <div className="form-group" style={{ animation: "slideDown 0.3s ease" }}>
                  <label>Specialization</label>
                  <div className="input-with-icon">
                    <BriefcaseMedical size={16} />
                    <input type="text" placeholder="e.g. Cardiologist" required value={specialty} onChange={e => setSpecialty(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ animation: "slideDown 0.3s ease" }}>
                  <label>Registration Number</label>
                  <div className="input-with-icon">
                    <BriefcaseMedical size={16} />
                    <input type="text" placeholder="e.g. MH-12345" required value={registrationNo} onChange={e => setRegistrationNo(e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="drawer-footer">
          <button className="button button-secondary" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </button>
          <button className="button button-primary" type="submit" form="edit-staff-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
