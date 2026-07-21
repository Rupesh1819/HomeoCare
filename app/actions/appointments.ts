"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export async function getAppointments(date?: Date) {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      patient: true,
      doctor: { include: { user: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return appointments.map((a) => ({
    id: a.appointmentNumber,
    dbId: a.id,
    patient: `${a.patient.firstName} ${a.patient.lastName}`,
    doctor: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
    time: a.scheduledAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
    mode: a.mode === "VIDEO" ? "Video" : "Clinic",
    status: a.status === "CONFIRMED" ? "Confirmed" : a.status === "WAITING" ? "Waiting" : a.status === "COMPLETED" ? "Completed" : a.status === "CANCELLED" ? "Reschedule" : "Confirmed",
    reason: a.reason || "",
  }));
}

export async function createAppointment(data: {
  patientName: string;
  time: string;
  reason: string;
  date?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");

  const branch = await prisma.branch.findFirst({ where: { clinicId: clinic.id } });
  if (!branch) throw new Error("No branch found.");

  const doctor = await prisma.doctor.findFirst();
  if (!doctor) throw new Error("No doctor found.");

  // Find or create patient by name
  const nameParts = data.patientName.trim().split(" ");
  const firstName = nameParts[0] || "New";
  const lastName = nameParts.slice(1).join(" ") || "Patient";

  let patient = await prisma.patient.findFirst({
    where: {
      clinicId: clinic.id,
      firstName: { equals: firstName, mode: "insensitive" },
      lastName: { equals: lastName, mode: "insensitive" },
    },
  });

  if (!patient) {
    const count = await prisma.patient.count({ where: { clinicId: clinic.id } });
    patient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        patientNumber: `PAT-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
        firstName,
        lastName,
        gender: "UNDISCLOSED",
        mobile: "N/A",
      },
    });
  }

  const count = await prisma.appointment.count({ where: { branchId: branch.id } });
  const appointmentNumber = `APT-${1040 + count + 1}`;

  const scheduledDate = data.date ? new Date(data.date) : new Date();
  const [timePart, meridiem] = data.time.split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);
  let hour24 = hours;
  if (meridiem?.toUpperCase() === "PM" && hours !== 12) hour24 += 12;
  if (meridiem?.toUpperCase() === "AM" && hours === 12) hour24 = 0;
  scheduledDate.setHours(hour24, minutes, 0, 0);

  await prisma.appointment.create({
    data: {
      branchId: branch.id,
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentNumber,
      scheduledAt: scheduledDate,
      status: "CONFIRMED",
      reason: data.reason,
    },
  });

  await createNotification(
    "New Appointment",
    `${patient.firstName} ${patient.lastName} has an appointment for ${scheduledDate.toLocaleDateString()} at ${data.time}.`,
    "APPOINTMENT"
  );

  revalidatePath("/appointments");
  revalidatePath("/");
}

export async function updateAppointmentStatus(appointmentNumber: string, newStatus: string) {
  const statusMap: Record<string, any> = {
    "Checked in": "WAITING",
    "Completed": "COMPLETED",
    "Reschedule": "CANCELLED",
    "Confirmed": "CONFIRMED",
  };
  const prismaStatus = statusMap[newStatus] || "CONFIRMED";

  const appointment = await prisma.appointment.findFirst({
    where: { appointmentNumber },
  });
  if (!appointment) throw new Error("Appointment not found");

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: prismaStatus },
  });

  revalidatePath("/appointments");
  revalidatePath("/");
}

export async function getTodayAppointmentCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.appointment.count({
    where: { scheduledAt: { gte: today, lt: tomorrow } },
  });
}
