"use client";

import { ChevronRight, HeartPulse, Pencil, ShieldCheck, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { useState, useRef } from "react";
import { updateClinicSettings, updateAdminProfile } from "@/app/actions/settings";
import { generateDatabaseBackup } from "@/app/actions/backup";
import { uploadClinicLogo } from "@/app/actions/upload";
import { User } from "lucide-react";

type ClinicSettings = {
  id: string;
  name: string;
  registrationNumber: string;
  gstin: string;
  phone: string;
  email: string;
  logoUrl: string;
  language: string;
  branchName: string;
  branchCity: string;
  branchState: string;
};

type AdminProfile = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
};

export function SettingsClient({ initialSettings, initialProfile }: { initialSettings: ClinicSettings; initialProfile: AdminProfile }) {
  const { darkMode, toggleTheme, language: storeLanguage, setLanguage, notify } = useAppStore();
  
  // Clinic Profile State
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // My Profile State
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [mobile, setMobile] = useState(initialProfile.mobile);

  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Logo Upload State
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState(initialSettings.name);
  const [regNo, setRegNo] = useState(initialSettings.registrationNumber);
  const [gstin, setGstin] = useState(initialSettings.gstin);
  const [phone, setPhone] = useState(initialSettings.phone);
  const [email, setEmail] = useState(initialSettings.email);
  const [lang, setLang] = useState(initialSettings.language);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadClinicLogo(formData);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        notify("Clinic logo updated successfully.");
        // Force refresh to update layout
        window.location.reload();
      } else {
        notify(`Upload failed: ${res.error}`);
      }
    } catch (err: any) {
      notify(`Upload failed: ${err.message || err}`);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    notify("Generating encrypted backup. Please wait...");
    
    try {
      const res = await generateDatabaseBackup();
      
      if (res.success && res.backupJson) {
        // Create Blob and download
        const blob = new Blob([res.backupJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        notify("Backup downloaded successfully.");
      } else {
        notify(`Backup failed: ${res.error}`);
      }
    } catch (err: any) {
      notify(`Backup failed: ${err.message || err}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClinicSettings({
        name,
        registrationNumber: regNo,
        gstin,
        phone,
        email,
        language: lang,
      });
      notify("Clinic settings saved successfully.");
      setEditing(false);
    } catch (err: any) {
      notify(`Failed to save settings: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      await updateAdminProfile({
        id: initialProfile.id,
        firstName,
        lastName,
        mobile,
      });
      notify("Profile updated successfully.");
      setProfileEditing(false);
    } catch (err: any) {
      notify(`Failed to update profile: ${err.message || err}`);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    setLanguage(newLang); // Sync with store/UI language
  };

  return (
    <div className="page-stack settings-layout">
      <div className="settings-nav">
        {[
          "Clinic profile",
          "Branches",
          "Notifications",
          "WhatsApp & SMS",
          "Language & appearance",
          "Security",
          "Backup & restore",
          "Audit logs",
        ].map((item, index) => (
          <button className={index === 0 ? "active" : ""} key={item}>
            {item}
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <div className="page-stack">
        <Panel>
          <div className="settings-heading">
            <div>
              <span className="panel-kicker">PERSONAL DETAILS</span>
              <h3>My Profile</h3>
              <p>Manage your account name and contact info.</p>
            </div>
            {!profileEditing && (
              <button className="icon-button" onClick={() => setProfileEditing(true)} title="Edit Profile">
                <Pencil size={17} />
              </button>
            )}
          </div>
          
          <div className="clinic-identity" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: profileEditing ? 0 : 20 }}>
            <span className="avatar avatar-large" style={{ background: "var(--primary)", color: "white" }}>
              {firstName[0] || ""}{lastName[0] || ""}
            </span>
            <div>
              <h3>{firstName} {lastName}</h3>
              <p>Clinic Administrator</p>
            </div>
          </div>

          {profileEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div className="form-grid">
                <label>
                  First Name
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>
                <label>
                  Last Name
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>
              </div>
              <label>
                Mobile Number
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </label>
              <div className="settings-save">
                <button className="button button-secondary" onClick={() => setProfileEditing(false)}>
                  Cancel
                </button>
                <button className="button button-primary" onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          ) : (
            <div className="settings-data-grid">
              <span>
                <small>Mobile Number</small>
                <strong>{mobile || "—"}</strong>
              </span>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="settings-heading">
            <div>
              <span className="panel-kicker">ORGANIZATION</span>
              <h3>Clinic information</h3>
              <p>Information displayed on prescriptions, invoices, and patient communication.</p>
            </div>
            {!editing ? (
              <button className="button button-secondary" onClick={() => setEditing(true)}>
                <Pencil size={16} /> Edit
              </button>
            ) : (
              <button className="button button-secondary" onClick={() => setEditing(false)}>
                <X size={16} /> Cancel
              </button>
            )}
          </div>
          <div className="clinic-profile-block">
            <span className="clinic-logo" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <HeartPulse size={30} />
              )}
            </span>
            <div>
              <h3>{name}</h3>
              <p>
                {initialSettings.branchName} · {initialSettings.branchCity}, {initialSettings.branchState}
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                accept="image/*"
                onChange={handleLogoUpload}
              />
              <button 
                className="text-button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
              >
                {logoUploading ? "Uploading..." : "Change clinic logo"}
              </button>
            </div>
          </div>

          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div className="form-grid">
                <label>
                  Clinic Name
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                  Registration number
                  <input value={regNo} onChange={(e) => setRegNo(e.target.value)} />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  GSTIN
                  <input value={gstin} onChange={(e) => setGstin(e.target.value)} />
                </label>
                <label>
                  Clinic phone
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
              </div>
              <label>
                Support email
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </label>
            </div>
          ) : (
            <div className="settings-data-grid">
              <span>
                <small>Registration number</small>
                <strong>{regNo || "—"}</strong>
              </span>
              <span>
                <small>GSTIN</small>
                <strong>{gstin || "—"}</strong>
              </span>
              <span>
                <small>Clinic phone</small>
                <strong>{phone || "—"}</strong>
              </span>
              <span>
                <small>Support email</small>
                <strong>{email || "—"}</strong>
              </span>
            </div>
          )}
        </Panel>
        <Panel>
          <div className="settings-heading">
            <div>
              <span className="panel-kicker">PERSONALIZATION</span>
              <h3>Language &amp; appearance</h3>
              <p>Choose how HomeoCare Pro appears for your account.</p>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <strong>Preferred language</strong>
              <span>Dashboard, forms, reports, and patient portal.</span>
            </div>
            <select value={storeLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="EN">English</option>
              <option value="हिंदी">हिंदी</option>
              <option value="मराठी">मराठी</option>
            </select>
          </div>
          <div className="setting-row">
            <div>
              <strong>Dark mode</strong>
              <span>Use a darker clinical workspace in low-light environments.</span>
            </div>
            <button className={`toggle ${darkMode ? "toggle-on" : ""}`} onClick={toggleTheme}>
              <span />
            </button>
          </div>
        </Panel>
        <Panel>
          <div className="settings-heading">
            <div>
              <span className="panel-kicker">DATA PROTECTION</span>
              <h3>Cloud backup</h3>
              <p>Encrypted database, report, and prescription backups.</p>
            </div>
            <span className="connected-pill">
              <i /> Healthy
            </span>
          </div>
          <div className="backup-card">
            <span className="card-icon">
              <ShieldCheck size={21} />
            </span>
            <div>
              <strong>Automatic daily backup</strong>
              <span>Last successful backup: Today, 03:00 AM</span>
            </div>
            <button
              className="button button-secondary"
              onClick={handleBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? "Backing up..." : "Back up now"}
            </button>
          </div>
        </Panel>
        {editing && (
          <div className="settings-save">
            <button className="button button-secondary" onClick={() => setEditing(false)}>
              Discard changes
            </button>
            <button className="button button-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
