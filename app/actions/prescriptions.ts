"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPrescriptions() {
  const prescriptions = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      items: true,
      labOrders: {
        include: {
          labTest: true,
        },
      },
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
  labTests?: { labTestId: string; notes?: string }[];
  instructions?: string;
  followUpDate?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");

  const doctorUser = await prisma.user.findFirst({ where: { role: "DOCTOR" }, include: { doctor: true } });
  if (!doctorUser) throw new Error("No doctor found.");

  const patient = await prisma.patient.findUnique({
    where: {
      id: data.patientId,
    },
  });

  if (!patient) throw new Error("Patient not found.");

  const count = await prisma.prescription.count();
  const prescriptionNo = `RX-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const prescription = await prisma.prescription.create({
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

  // Create Lab Orders if lab tests were prescribed
  let totalLabCharges = 0;
  if (data.labTests && data.labTests.length > 0) {
    const labTestDetails = await prisma.labTest.findMany({
      where: {
        id: { in: data.labTests.map((t) => t.labTestId) },
      },
    });

    for (const testReq of data.labTests) {
      const detail = labTestDetails.find((d) => d.id === testReq.labTestId);
      if (detail) {
        totalLabCharges += Number(detail.price);
        await prisma.labOrder.create({
          data: {
            clinicId: clinic.id,
            patientId: patient.id,
            prescriptionId: prescription.id,
            doctorId: doctorUser.id,
            labTestId: detail.id,
            status: "PENDING",
            notes: testReq.notes || null,
          },
        });
      }
    }
  }

  // Create Invoice or update billing
  const branch = await prisma.branch.findFirst({ where: { clinicId: clinic.id } });
  if (branch) {
    const invCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`;
    const consultationFee = Number(doctorUser.doctor?.consultationFee || 500);
    const medicineCharges = data.items.length * 100;

    await prisma.invoice.create({
      data: {
        clinicId: clinic.id,
        branchId: branch.id,
        patientId: patient.id,
        invoiceNumber,
        consultationFee,
        medicineCharges,
        labCharges: totalLabCharges,
        total: consultationFee + medicineCharges + totalLabCharges,
        status: "PENDING",
      },
    });
  }

  revalidatePath("/prescriptions");
  revalidatePath("/lab-dashboard");
  revalidatePath("/billing");
  revalidatePath("/patients");

  return prescription;
}
