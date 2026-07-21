"use server";

import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "@/app/actions/settings";

export async function getAuditLogs() {
  const profile = await getAdminProfile();
  
  // Only Clinic Admins and Super Admins can view audit logs
  if (profile.role !== "CLINIC_ADMIN" && profile.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized access to audit logs.");
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId || "-",
    metadata: log.metadata,
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : "System",
    userRole: log.user?.role || "SYSTEM",
    userEmail: log.user?.email || "-",
    timestamp: log.createdAt.toISOString(),
  }));
}
