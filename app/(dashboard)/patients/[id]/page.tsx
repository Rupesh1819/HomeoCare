import { getPatientById } from "@/app/actions/patients";
import { PatientProfile } from "./PatientProfile";
import { notFound } from "next/navigation";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  // Serialize dates and Decimals for client component
  const serialized = {
    id: patient.patientNumber,
    dbId: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
    initials: `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase(),
    age: patient.dateOfBirth
      ? Math.floor(
          (Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 86400000)
        )
      : 0,
    gender:
      patient.gender === "MALE"
        ? "Male"
        : patient.gender === "FEMALE"
          ? "Female"
          : "Other",
    mobile: patient.mobile,
    email: patient.email || "",
    condition: patient.disease || patient.chiefComplaint || "No condition noted",
    lastVisit: patient.updatedAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    nextFollowUp:
      patient.followUps?.[0]?.dueAt
        ? patient.followUps[0].dueAt.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not scheduled",
    status: "Active",
    color:
      [
        "#dbeafe",
        "#dcfce7",
        "#f3e8ff",
        "#fee2e2",
        "#fef3c7",
        "#cffafe",
      ][Math.abs(patient.firstName.charCodeAt(0)) % 6],
    address: patient.address || "",
    city: patient.city || "",
    state: patient.state || "",
    chiefComplaint: patient.chiefComplaint || "",
    disease: patient.disease || "",
    allergyHistory: patient.allergyHistory || "",
    familyHistory: patient.familyHistory || "",
    treatments: (patient.treatments || []).map((t) => ({
      id: t.id,
      date: t.consultationDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      symptoms: t.symptoms,
      diagnosis: t.diagnosis,
      medicine: t.medicine,
      potency: t.potency,
      dosage: t.dosage,
    })),
    appointments: (patient.appointments || []).map((a) => ({
      id: a.id,
      date: a.scheduledAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: a.scheduledAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: a.status,
      reason: a.reason || "",
      doctorName: a.doctor?.user
        ? `${a.doctor.user.firstName} ${a.doctor.user.lastName}`
        : "Doctor",
    })),
    followUps: (patient.followUps || []).map((f) => ({
      id: f.id,
      dueAt: f.dueAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: f.status,
      notes: f.notes || "",
    })),
    medicalReports: (patient.reports || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      date: r.createdAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      type: r.mimeType,
      url: null, // Fetched on demand
      storagePath: r.storagePath,
    })),
    labOrders: (patient.labOrders || []).map((l: any) => ({
      id: l.id,
      testName: l.labTest?.name || "Diagnostic Test",
      category: l.labTest?.category || "Lab",
      price: Number(l.labTest?.price || 0),
      doctorName: l.doctor ? `Dr. ${l.doctor.firstName} ${l.doctor.lastName}` : "Doctor",
      status: l.status,
      notes: l.notes || "",
      reportUrl: l.reportUrl || null,
      reportStoragePath: l.reportStoragePath || null,
      orderedAt: l.orderedAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      completedAt: l.completedAt
        ? l.completedAt.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : null,
    })),
    latestVitals: patient.vitals?.[0] ? {
      bp: patient.vitals[0].bp,
      heartRate: patient.vitals[0].heartRate,
      weight: patient.vitals[0].weight,
      temperature: patient.vitals[0].temperature,
      recordedAt: patient.vitals[0].recordedAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    } : null,
  };

  return <PatientProfile patient={serialized} />;
}
