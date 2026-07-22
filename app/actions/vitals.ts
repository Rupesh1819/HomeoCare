"use server";

import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "./settings";
import { revalidatePath } from "next/cache";

export async function addVitals(formData: FormData) {
  try {
    const profile = await getAdminProfile();
    if (!profile) {
      return { success: false, error: "Unauthorized" };
    }

    const patientId = formData.get("patientId") as string;
    const bp = formData.get("bp") as string;
    const heartRateStr = formData.get("heartRate") as string;
    const weightStr = formData.get("weight") as string;
    const temperatureStr = formData.get("temperature") as string;

    if (!patientId) {
      return { success: false, error: "Patient ID is required" };
    }

    const newVitals = await prisma.vitals.create({
      data: {
        patientId,
        bp: bp || null,
        heartRate: heartRateStr ? parseInt(heartRateStr) : null,
        weight: weightStr ? parseFloat(weightStr) : null,
        temperature: temperatureStr ? parseFloat(temperatureStr) : null,
        recordedBy: `${profile.firstName} ${profile.lastName}`,
      },
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true, data: newVitals };
  } catch (error: any) {
    console.error("Failed to add vitals:", error);
    return { success: false, error: error.message || "Failed to add vitals" };
  }
}

export async function getLatestVitals(patientId: string) {
  try {
    const profile = await getAdminProfile();
    if (!profile) return null;

    return await prisma.vitals.findFirst({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch vitals:", error);
    return null;
  }
}
