"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const notifications = await prisma.alert.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications;
}

export async function createNotification(title: string, message: string, type: string) {
  await prisma.alert.create({
    data: {
      title,
      message,
      type,
    }
  });
}

export async function markAllAsRead() {
  await prisma.alert.updateMany({
    where: { read: false },
    data: { read: true },
  });
  revalidatePath("/");
}
