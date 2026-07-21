"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPrescriptions() {
  const prescriptions = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return prescriptions;
}

export async function createPrescription(data: {
  patientId: string;
  diagnosis: string;
  items: { medicine: string; potency: string; dosage: string; duration?: string; instructions?: string }[];
  instructions?: string;
  followUpDate?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");

  const doctorUser = await prisma.user.findFirst({ where: { role: "DOCTOR" } });
  if (!doctorUser) throw new Error("No doctor found.");

  const patient = await prisma.patient.findUnique({
    where: {
      id: data.patientId,
    },
  });

  if (!patient) throw new Error("Patient not found.");

  const count = await prisma.prescription.count();
  const prescriptionNo = `RX-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  await prisma.prescription.create({
    data: {
      patientId: patient.id,
      doctorUserId: doctorUser.id,
      prescriptionNo,
      instructions: data.instructions,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      items: {
        create: data.items.map((item) => ({
          medicine: item.medicine,
          potency: item.potency,
          dosage: item.dosage,
          duration: item.duration,
          instructions: item.instructions,
        })),
      },
    },
  });

  revalidatePath("/prescriptions");
}
