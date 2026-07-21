"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTreatments() {
  const treatments = await prisma.treatment.findMany({
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { consultationDate: "desc" },
    take: 50,
  });

  return treatments.map((t) => ({
    id: t.id,
    date: t.consultationDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    patient: `${t.patient.firstName} ${t.patient.lastName}`,
    diagnosis: t.diagnosis,
    medicine: `${t.medicine} ${t.potency}`,
    followup: t.followUpDate
      ? t.followUpDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      : "-",
  }));
}

export async function createTreatment(data: {
  patientName: string;
  symptoms: string;
  diagnosis: string;
  medicine: string;
  potency: string;
  dosage?: string;
  duration?: string;
  doctorNotes?: string;
  followUpDate?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");

  const doctorUser = await prisma.user.findFirst({ where: { role: "DOCTOR" } });
  if (!doctorUser) throw new Error("No doctor found.");

  // Find patient by name
  const nameParts = data.patientName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  const patient = await prisma.patient.findFirst({
    where: {
      clinicId: clinic.id,
      firstName: { equals: firstName, mode: "insensitive" },
      ...(lastName ? { lastName: { equals: lastName, mode: "insensitive" } } : {}),
    },
  });

  if (!patient) throw new Error("Patient not found.");

  await prisma.treatment.create({
    data: {
      patientId: patient.id,
      doctorUserId: doctorUser.id,
      consultationDate: new Date(),
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      medicine: data.medicine,
      potency: data.potency,
      dosage: data.dosage || "",
      duration: data.duration,
      doctorNotes: data.doctorNotes,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
    },
  });

  revalidatePath("/treatments");
  revalidatePath("/");
}

export async function getActiveTreatmentCount() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return prisma.treatment.count({
    where: { consultationDate: { gte: thirtyDaysAgo } },
  });
}
