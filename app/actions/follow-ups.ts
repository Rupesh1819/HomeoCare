"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFollowUps() {
  const followUps = await prisma.followUp.findMany({
    include: { patient: true },
    orderBy: { dueAt: "asc" },
    take: 50,
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return {
    overdue: followUps
      .filter((f) => f.dueAt < now && f.status !== "COMPLETED")
      .map((f) => ({
        id: f.id,
        name: `${f.patient.firstName} ${f.patient.lastName}`,
        condition: f.patient.disease || f.patient.chiefComplaint || "",
        due: `${Math.ceil((now.getTime() - f.dueAt.getTime()) / 86400000)} day(s) overdue`,
      })),
    dueToday: followUps
      .filter((f) => f.dueAt >= now && f.dueAt <= endOfToday && f.status !== "COMPLETED")
      .map((f) => ({
        id: f.id,
        name: `${f.patient.firstName} ${f.patient.lastName}`,
        condition: f.patient.disease || f.patient.chiefComplaint || "",
        due: f.dueAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      })),
    upcoming: followUps
      .filter((f) => f.dueAt > endOfToday && f.status !== "COMPLETED")
      .map((f) => {
        const diffDays = Math.ceil((f.dueAt.getTime() - now.getTime()) / 86400000);
        return {
          id: f.id,
          name: `${f.patient.firstName} ${f.patient.lastName}`,
          condition: f.patient.disease || f.patient.chiefComplaint || "",
          due: diffDays === 1 ? "Tomorrow" : f.dueAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        };
      }),
  };
}

export async function getFollowUpCounts() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const [overdue, dueToday, dueTomorrow, completed, total] = await Promise.all([
    prisma.followUp.count({ where: { dueAt: { lt: now }, status: { not: "COMPLETED" } } }),
    prisma.followUp.count({ where: { dueAt: { gte: now, lte: endOfToday }, status: { not: "COMPLETED" } } }),
    prisma.followUp.count({ where: { dueAt: { gte: tomorrow, lte: endOfTomorrow }, status: { not: "COMPLETED" } } }),
    prisma.followUp.count({ where: { status: "COMPLETED" } }),
    prisma.followUp.count(),
  ]);

  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0";

  return { overdue, dueToday, dueTomorrow, completionRate: `${completionRate}%` };
}

export async function markFollowUpCompleted(id: string) {
  await prisma.followUp.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}
