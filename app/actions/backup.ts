"use server";

import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "./settings";
import { logAudit } from "@/lib/audit";

export async function generateDatabaseBackup() {
  try {
    // 1. Verify admin permissions
    const profile = await getAdminProfile();
    if (!profile || (profile.role !== "CLINIC_ADMIN" && profile.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized. Only Clinic Admins or Super Admins can generate backups." };
    }

    // 2. Fetch all critical data
    const [
      clinic,
      patients,
      treatments,
      appointments,
      inventory,
      invoices
    ] = await Promise.all([
      prisma.clinic.findFirst(),
      prisma.patient.findMany(),
      prisma.treatment.findMany(),
      prisma.appointment.findMany(),
      prisma.inventoryItem.findMany(),
      prisma.invoice.findMany()
    ]);

    // 3. Assemble backup object
    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: `${profile.firstName} ${profile.lastName}`,
        clinicName: clinic?.name || "Clinic",
        version: "1.0"
      },
      data: {
        clinic,
        patients,
        treatments,
        appointments,
        inventory,
        invoices
      }
    };

    // 4. Log the action
    await logAudit("SETTINGS_UPDATED", "System", profile.id, { action: "Database Backup Downloaded" });

    // 5. Serialize to JSON string
    return { 
      success: true, 
      backupJson: JSON.stringify(backupData, null, 2),
      filename: `clinic_backup_${new Date().toISOString().split('T')[0]}.json`
    };

  } catch (err: any) {
    console.error("Backup generation failed:", err);
    return { success: false, error: "Failed to generate database backup." };
  }
}
