"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  try {
    // Get the current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let dbUser = null;
    if (user) {
      dbUser = await prisma.user.findUnique({ where: { authUserId: user.id } });
      if (!dbUser && user.email) {
        dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      }
    }

    // Get the clinic
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return;

    await prisma.auditLog.create({
      data: {
        clinicId: clinic.id,
        userId: dbUser?.id || null,
        action,
        entity,
        entityId: entityId || undefined,
        metadata: metadata || undefined,
      },
    });
  } catch (err) {
    // Audit logging should never crash the main operation
    console.error("Audit log error:", err);
  }
}
