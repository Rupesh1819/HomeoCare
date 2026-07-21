"use client";

import { ShieldCheck, X, Check, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type RoleAccessDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  role: string;
};

const PERMISSIONS: Record<string, { label: string; allowed: boolean }[]> = {
  CLINIC_ADMIN: [
    { label: "Manage clinic settings & branding", allowed: true },
    { label: "Manage staff roles and access", allowed: true },
    { label: "View all patient records", allowed: true },
    { label: "Edit financial and billing data", allowed: true },
    { label: "Prescribe medication", allowed: false },
  ],
  DOCTOR: [
    { label: "View all patient records", allowed: true },
    { label: "Add clinical notes and diagnoses", allowed: true },
    { label: "Prescribe medication", allowed: true },
    { label: "View financial data", allowed: false },
    { label: "Manage clinic settings", allowed: false },
  ],
  RECEPTIONIST: [
    { label: "Schedule appointments", allowed: true },
    { label: "Register new patients", allowed: true },
    { label: "View basic patient profiles", allowed: true },
    { label: "View clinical notes", allowed: false },
    { label: "Prescribe medication", allowed: false },
  ],
  PHARMACIST: [
    { label: "Manage medicine inventory", allowed: true },
    { label: "View active prescriptions", allowed: true },
    { label: "Dispense medication", allowed: true },
    { label: "View clinical diagnoses", allowed: false },
    { label: "Manage staff roles", allowed: false },
  ],
  LAB_TECHNICIAN: [
    { label: "Upload medical reports", allowed: true },
    { label: "View patient reports", allowed: true },
    { label: "View financial data", allowed: false },
    { label: "Prescribe medication", allowed: false },
    { label: "Manage clinic settings", allowed: false },
  ],
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  CLINIC_ADMIN: "Full access to clinic management, staff, and settings.",
  DOCTOR: "Clinical access for diagnosing and treating patients.",
  RECEPTIONIST: "Front-desk access for scheduling and patient registration.",
  PHARMACIST: "Inventory and prescription management.",
  LAB_TECHNICIAN: "Access to upload and manage patient medical reports.",
};

export function RoleAccessDrawer({ isOpen, onClose, role }: RoleAccessDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  // normalize role string
  const normalizedRole = role.toUpperCase().replace(" ", "_");
  const permissions = PERMISSIONS[normalizedRole] || PERMISSIONS["RECEPTIONIST"];
  const description = ROLE_DESCRIPTIONS[normalizedRole] || "Staff member access level.";

  if (!isOpen) return null;

  return (
    <div className="drawer-layer">
          <div className="drawer-scrim" onClick={onClose} />
          <div className="drawer drawer-open">
        <div className="drawer-header">
          <div className="drawer-title">
            <ShieldCheck size={20} color="var(--primary)" />
            <div>
              <h3>{role} Access</h3>
              <p>{description}</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <div className="role-permissions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
              Capabilities
            </h4>
            
            {permissions.map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {perm.allowed ? (
                  <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                    <Check size={18} />
                  </div>
                ) : (
                  <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                    <XCircle size={18} />
                  </div>
                )}
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: perm.allowed ? 'var(--text)' : 'var(--muted)' }}>
                    {perm.label}
                  </strong>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {perm.allowed ? "Granted" : "Restricted"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', padding: '16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Need to change permissions?</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Currently, permissions are strictly bound to the staff role to ensure compliance and data security. 
              To change what a staff member can do, you must change their assigned Role by editing their profile.
            </p>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
