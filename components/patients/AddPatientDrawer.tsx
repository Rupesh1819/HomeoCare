"use client";

import { Check, ChevronRight, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { createPatient } from "@/app/actions/patients";

export function AddPatientDrawer() {
  const { setAddingPatient, notify } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    gender: "Female",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    city: "Pune",
    state: "Maharashtra",
    complaint: "",
    symptoms: "",
    disease: "",
    allergies: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyMobile: "",
  });

  const update = (key: keyof typeof data, value: string) =>
    setData((current) => ({ ...current, [key]: value }));

  const onClose = () => setAddingPatient(false);

  const save = async () => {
    if (!data.firstName || !data.lastName) {
      notify("Please enter at least first and last name.");
      return;
    }
    if (!data.mobile) {
      notify("Please enter a mobile number.");
      return;
    }

    setSaving(true);
    try {
      const genderMap: Record<string, string> = {
        Male: "MALE",
        Female: "FEMALE",
        Other: "OTHER",
      };

      await createPatient({
        firstName: data.firstName,
        lastName: data.lastName,
        gender: genderMap[data.gender] || "OTHER",
        mobile: data.mobile,
        email: data.email || undefined,
        dateOfBirth: data.dob || undefined,
        chiefComplaint: data.complaint || undefined,
        disease: data.disease || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        allergyHistory: data.allergies || undefined,
      });

      notify(`${data.firstName} ${data.lastName} was registered successfully.`);
      setAddingPatient(false);
      router.refresh();
    } catch (err: any) {
      notify(`Registration failed: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const stepFields = [
    <div className="drawer-form" key="personal">
      <div className="form-grid">
        <label>
          First name
          <input
            value={data.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            autoFocus
          />
        </label>
        <label>
          Last name
          <input
            value={data.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </label>
      </div>
      <label>
        Gender
        <div className="gender-options">
          {["Male", "Female", "Other"].map((item) => (
            <button
              type="button"
              className={data.gender === item ? "active" : ""}
              onClick={() => update("gender", item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </label>
      <div className="form-grid">
        <label>
          Date of birth
          <input
            type="date"
            value={data.dob}
            onChange={(e) => update("dob", e.target.value)}
          />
        </label>
        <label>
          Mobile number
          <input
            value={data.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </label>
      </div>
      <label>
        Email address
        <input
          type="email"
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="patient@example.com"
        />
      </label>
    </div>,
    <div className="drawer-form" key="address">
      <label>
        Address
        <textarea
          value={data.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="House, street, area"
        />
      </label>
      <div className="form-grid">
        <label>
          City
          <input
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </label>
        <label>
          State
          <input
            value={data.state}
            onChange={(e) => update("state", e.target.value)}
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Postal code
          <input placeholder="411001" />
        </label>
        <label>
          Country
          <select>
            <option>India</option>
          </select>
        </label>
      </div>
    </div>,
    <div className="drawer-form" key="medical">
      <label>
        Chief complaint
        <textarea
          value={data.complaint}
          onChange={(e) => update("complaint", e.target.value)}
          placeholder="Primary reason for consultation"
        />
      </label>
      <label>
        Symptoms
        <textarea
          value={data.symptoms}
          onChange={(e) => update("symptoms", e.target.value)}
          placeholder="Symptoms, duration, modalities"
        />
      </label>
      <div className="form-grid">
        <label>
          Known disease
          <input
            value={data.disease}
            onChange={(e) => update("disease", e.target.value)}
          />
        </label>
        <label>
          Allergies
          <input
            value={data.allergies}
            onChange={(e) => update("allergies", e.target.value)}
            placeholder="None known"
          />
        </label>
      </div>
      <label>
        Previous treatments
        <textarea placeholder="Medication and prior care" />
      </label>
    </div>,
    <div className="drawer-form" key="emergency">
      <label>
        Contact name
        <input
          value={data.emergencyName}
          onChange={(e) => update("emergencyName", e.target.value)}
        />
      </label>
      <div className="form-grid">
        <label>
          Relationship
          <input
            value={data.emergencyRelation}
            onChange={(e) => update("emergencyRelation", e.target.value)}
          />
        </label>
        <label>
          Mobile number
          <input
            value={data.emergencyMobile}
            onChange={(e) => update("emergencyMobile", e.target.value)}
          />
        </label>
      </div>
      <div className="consent-card">
        <ShieldCheck size={21} />
        <div>
          <strong>Patient consent</strong>
          <p>
            Confirm consent for secure digital records and appointment
            communication.
          </p>
        </div>
        <input type="checkbox" defaultChecked />
      </div>
      <div className="registration-summary">
        <span className="panel-kicker">READY TO REGISTER</span>
        <h3>
          {data.firstName || "New"} {data.lastName || "patient"}
        </h3>
        <p>
          {data.mobile || "Mobile not added"} ·{" "}
          {data.disease || "Initial assessment pending"}
        </p>
      </div>
    </div>,
  ];

  return (
    <div className="drawer-layer">
      <button
        className="drawer-scrim"
        aria-label="Close add patient"
        onClick={onClose}
      />
      <aside className="drawer">
        <header className="drawer-header">
          <div>
            <span className="kicker">PATIENT REGISTRATION</span>
            <h2>Add patient</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </header>
        <div className="stepper">
          {[1, 2, 3, 4].map((item) => (
            <div className={step >= item ? "active" : ""} key={item}>
              <span>
                {step > item ? <Check size={13} /> : item}
              </span>
              <i />
            </div>
          ))}
        </div>
        <div className="drawer-title">
          <span>
            STEP {step} OF 4
          </span>
          <h3>
            {
              [
                "Personal information",
                "Address details",
                "Medical information",
                "Emergency contact",
              ][step - 1]
            }
          </h3>
          <p>
            {
              [
                "Basic identity and communication details.",
                "Patient residence and location.",
                "Clinical context for the first consultation.",
                "Trusted contact and record consent.",
              ][step - 1]
            }
          </p>
        </div>
        <div className="drawer-body">{stepFields[step - 1]}</div>
        <footer className="drawer-footer">
          <button
            className="button button-secondary"
            onClick={step === 1 ? () => setAddingPatient(false) : () => setStep((c) => c - 1)}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            className="button button-primary"
            onClick={step === 4 ? save : () => setStep((c) => c + 1)}
            disabled={step === 4 && saving}
          >
            {step === 4 ? (saving ? "Saving..." : "Register patient") : "Continue"}
            {!saving && <ChevronRight size={16} />}
          </button>
        </footer>
      </aside>
    </div>
  );
}
