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

  const p: any = patient;

  // Serialize dates and Decimals for client component
  const serialized = {
    id: p.patientNumber,
    dbId: p.id,
    name: `${p.firstName} ${p.lastName}`,
    initials: `${p.firstName[0]}${p.lastName[0]}`.toUpperCase(),
    age: p.dateOfBirth
      ? Math.floor(
          (Date.now() - p.dateOfBirth.getTime()) / (365.25 * 86400000)
        )
      : 0,
    gender:
      p.gender === "MALE"
        ? "Male"
        : p.gender === "FEMALE"
          ? "Female"
          : "Other",
    mobile: p.mobile,
    email: p.email || "",
    condition: p.disease || p.chiefComplaint || "No condition noted",
    lastVisit: p.updatedAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    nextFollowUp:
      p.followUps?.[0]?.dueAt
        ? p.followUps[0].dueAt.toLocaleDateString("en-IN", {
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
      ][Math.abs(p.firstName.charCodeAt(0)) % 6],
    address: p.address || "",
    city: p.city || "",
    state: p.state || "",
    chiefComplaint: p.chiefComplaint || "",
    disease: p.disease || "",
    allergyHistory: p.allergyHistory || "",
    familyHistory: p.familyHistory || "",
    treatments: (p.treatments || []).map((t: any) => ({
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
    appointments: (p.appointments || []).map((a: any) => ({
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
    followUps: (p.followUps || []).map((f: any) => ({
      id: f.id,
      dueAt: f.dueAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: f.status,
      notes: f.notes || "",
    })),
    medicalReports: (p.reports || []).map((r: any) => ({
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
    labOrders: (p.labOrders || []).map((l: any) => ({
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
    latestVitals: p.vitals?.[0] ? {
      bp: p.vitals[0].bp,
      heartRate: p.vitals[0].heartRate,
      weight: p.vitals[0].weight,
      temperature: p.vitals[0].temperature,
      recordedAt: p.vitals[0].recordedAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    } : null,
  };

  return <PatientProfile patient={serialized} />;
}
