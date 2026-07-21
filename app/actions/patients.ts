"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function getPatients(query?: string, status?: string) {
  const where: any = { isArchived: false };

  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { patientNumber: { contains: query, mode: "insensitive" } },
      { mobile: { contains: query } },
      { disease: { contains: query, mode: "insensitive" } },
    ];
  }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return patients.map((p) => ({
    id: p.patientNumber,
    dbId: p.id,
    name: `${p.firstName} ${p.lastName}`,
    initials: `${p.firstName[0]}${p.lastName[0]}`,
    age: p.dateOfBirth
      ? Math.floor(
          (Date.now() - p.dateOfBirth.getTime()) / (365.25 * 86400000)
        )
      : 0,
    gender: p.gender === "MALE" ? "Male" : p.gender === "FEMALE" ? "Female" : "Other",
    mobile: p.mobile,
    email: p.email || "",
    condition: p.disease || p.chiefComplaint || "",
    lastVisit: p.updatedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    nextFollowUp: "-",
    status: "Active" as const,
    color: ["#dbeafe", "#dcfce7", "#f3e8ff", "#fee2e2", "#fef3c7", "#cffafe"][
      Math.abs(p.firstName.charCodeAt(0)) % 6
    ],
  }));
}

export async function getPatientById(patientNumber: string) {
  const patient = await prisma.patient.findFirst({
    where: { patientNumber },
    include: {
      appointments: { orderBy: { scheduledAt: "desc" }, take: 10, include: { doctor: { include: { user: true } } } },
      treatments: { orderBy: { consultationDate: "desc" }, take: 10 },
      prescriptions: { orderBy: { createdAt: "desc" }, take: 10, include: { items: true } },
      invoices: { orderBy: { createdAt: "desc" }, take: 10, include: { payments: true } },
      followUps: { orderBy: { dueAt: "desc" }, take: 10 },
      reports: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  return patient;
}

export async function createPatient(data: {
  firstName: string;
  lastName: string;
  gender: string;
  mobile: string;
  email?: string;
  dateOfBirth?: string;
  chiefComplaint?: string;
  disease?: string;
  address?: string;
  city?: string;
  state?: string;
  allergyHistory?: string;
  familyHistory?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found. Run seed first.");

  const count = await prisma.patient.count({ where: { clinicId: clinic.id } });
  const patientNumber = `PAT-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const patient = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      patientNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender as any,
      mobile: data.mobile,
      email: data.email,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      chiefComplaint: data.chiefComplaint,
      disease: data.disease,
      address: data.address,
      city: data.city,
      state: data.state,
      allergyHistory: data.allergyHistory,
      familyHistory: data.familyHistory,
    },
  });

  await logAudit("PATIENT_REGISTERED", "Patient", patient.id, { 
    name: `${data.firstName} ${data.lastName}`, 
    patientNumber: patient.patientNumber 
  });

  revalidatePath("/patients");
  revalidatePath("/");
  return patient;
}

export async function getPatientCount() {
  return prisma.patient.count({ where: { isArchived: false } });
}

export async function deletePatient(dbId: string) {
  const patient = await prisma.patient.update({
    where: { id: dbId },
    data: { isArchived: true },
  });

  await logAudit("PATIENT_DELETED", "Patient", patient.id, { 
    name: `${patient.firstName} ${patient.lastName}`, 
    patientNumber: patient.patientNumber 
  });

  revalidatePath("/patients");
  revalidatePath("/");
  return { success: true };
}

export async function updatePatient(dbId: string, data: Partial<{
  firstName: string;
  lastName: string;
  gender: any;
  mobile: string;
  email: string;
  dateOfBirth: Date;
  address: string;
  city: string;
  state: string;
  chiefComplaint: string;
  disease: string;
  symptoms: string;
  allergyHistory: string;
  familyHistory: string;
}>) {
  const patient = await prisma.patient.update({
    where: { id: dbId },
    data,
  });

  await logAudit("PATIENT_UPDATED", "Patient", patient.id, { 
    name: `${patient.firstName} ${patient.lastName}`, 
    patientNumber: patient.patientNumber 
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${patient.patientNumber}`);
  return patient;
}

export async function addTreatment(patientId: string, data: {
  symptoms: string;
  observations?: string;
  diagnosis: string;
  medicine: string;
  potency: string;
  dosage: string;
  duration?: string;
  doctorNotes?: string;
}) {
  const { getAdminProfile } = await import("./settings");
  const profile = await getAdminProfile();

  const treatment = await prisma.treatment.create({
    data: {
      patientId,
      doctorUserId: profile.id,
      consultationDate: new Date(),
      symptoms: data.symptoms,
      observations: data.observations,
      diagnosis: data.diagnosis,
      medicine: data.medicine,
      potency: data.potency,
      dosage: data.dosage,
      duration: data.duration,
      doctorNotes: data.doctorNotes,
    },
  });

  await logAudit("TREATMENT_ADDED", "Treatment", treatment.id, {
    patientId,
    diagnosis: data.diagnosis,
  });

  // Revalidate patient pages
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (patient) {
    revalidatePath(`/patients/${patient.patientNumber}`);
  }
  
  return { success: true, treatment };
}
