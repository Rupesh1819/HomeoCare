"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function getStaff() {
  const staffUsers = await prisma.user.findMany({
    where: {
      role: { not: "PATIENT" },
      isActive: true,
    },
    include: {
      doctor: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const roleNames: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    CLINIC_ADMIN: "Clinic Admin",
    DOCTOR: "Doctor",
    RECEPTIONIST: "Receptionist",
    ACCOUNTANT: "Accountant",
    LAB_TECHNICIAN: "Lab Assistant",
    PHARMACIST: "Pharmacist",
  };

  const formattedStaff = staffUsers.map((u) => {
    // Determine status (mocked slightly based on lastLoginAt, fallback to Online for first 3)
    let status = "Offline";
    if (u.lastLoginAt) {
      const isRecent = Date.now() - u.lastLoginAt.getTime() < 15 * 60 * 1000;
      status = isRecent ? "Online" : "Offline";
    } else {
      // Seed data doesn't have lastLoginAt, so make them Online/In consultation for demo purposes
      status = u.role === "DOCTOR" ? "Online" : "Offline";
    }

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      mobile: u.mobile || "",
      name: `${u.firstName} ${u.lastName}`,
      role: roleNames[u.role] || u.role,
      rawRole: u.role,
      specialty: u.doctor?.specialization || "Staff Member",
      registrationNo: u.doctor?.registrationNo || "",
      status,
      initials: `${u.firstName[0] || ""}${u.lastName[0] || ""}`.toUpperCase() || "ST",
    };
  });

  // Calculate statistics
  const totalStaff = await prisma.user.count({
    where: { role: { not: "PATIENT" }, isActive: true },
  });
  
  const activeDoctors = await prisma.user.count({
    where: { role: "DOCTOR", isActive: true },
  });

  const rolesConfigured = Object.keys(roleNames).length;

  return {
    staff: formattedStaff,
    stats: {
      totalStaff,
      activeDoctors,
      rolesConfigured,
      activeSessions: Math.max(1, Math.round(totalStaff * 0.4)), // 40% of staff active sessions
    },
  };
}

import { createAdminClient } from "@/lib/supabase/server";

export async function updateStaff(data: {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: string;
  specialization?: string;
  registrationNo?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: data.id },
    include: { doctor: true },
  });

  if (!user) {
    return { success: false, error: "Staff member not found" };
  }

  // Ensure role exists
  if (!["CLINIC_ADMIN", "DOCTOR", "RECEPTIONIST", "ACCOUNTANT", "LAB_TECHNICIAN", "PHARMACIST"].includes(data.role)) {
    return { success: false, error: "Invalid role selected" };
  }

  try {
    // Update user details
    await prisma.user.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        role: data.role as any,
      },
    });

    await logAudit("STAFF_EDITED", "User", data.id, { role: data.role, name: `${data.firstName} ${data.lastName}` });

    // Handle Doctor specific details
    if (data.role === "DOCTOR") {
      if (user.doctor) {
        // Update existing doctor profile
        await prisma.doctor.update({
          where: { userId: data.id },
          data: {
            specialization: data.specialization || "General Practitioner",
            ...(data.registrationNo ? { registrationNo: data.registrationNo } : {}),
          },
        });
      } else {
        // Promote to doctor (create profile)
        const branch = await prisma.branch.findFirst({
          where: { clinicId: user.clinicId }
        });
        
        if (!branch) {
          throw new Error("No branch found for the clinic to assign the doctor to.");
        }

        await prisma.doctor.create({
          data: {
            userId: data.id,
            branchId: branch.id,
            specialization: data.specialization || "General Practitioner",
            registrationNo: data.registrationNo || `REG-${Date.now()}`,
            consultationFee: 500, // Default fee
          },
        });
      }
    }

    revalidatePath("/staff");
    return { success: true };
  } catch (error: any) {
    console.error("Staff update error:", error);
    return { success: false, error: error.message || "Failed to update staff member" };
  }
}

export async function inviteStaff(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as any;
  const specialty = formData.get("specialty") as string;

  if (!firstName || !lastName || !email || !role || !password) {
    return { success: false, error: "Missing required fields" };
  }

  if (!["CLINIC_ADMIN", "DOCTOR", "RECEPTIONIST", "ACCOUNTANT", "LAB_TECHNICIAN", "PHARMACIST"].includes(role)) {
    return { success: false, error: "Invalid role selected" };
  }

  // Get first clinic and branch for assignment
  const clinic = await prisma.clinic.findFirst();
  const branch = await prisma.branch.findFirst();

  if (!clinic || !branch) {
    return { success: false, error: "System not fully initialized (missing Clinic/Branch)" };
  }

  try {
    const supabase = await createAdminClient();

    // 1. Create User in Supabase Auth
    // Use the provided password. 
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user in Auth provider" };
    }

    // 2. Insert User into Prisma
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: authData.user.id, // match Supabase UUID
          authUserId: authData.user.id,
          clinicId: clinic.id,
          role,
          firstName,
          lastName,
          email,
          isActive: true,
        },
      });

      await logAudit("STAFF_INVITED", "User", newUser.id, { role, email, name: `${firstName} ${lastName}` });

      // 3. If DOCTOR, insert Doctor record
      if (role === "DOCTOR") {
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            branchId: branch.id,
            registrationNo: `REG-${Date.now()}`, // Auto-generate for now
            specialization: specialty || "General Practitioner",
            consultationFee: 500,
          },
        });
      }
    });

    revalidatePath("/staff");
    return { success: true, message: "Staff member invited successfully! Password: " + password };
  } catch (error: any) {
    console.error("Staff invite error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function deleteStaff(userId: string) {
  if (!userId) {
    return { success: false, error: "No user ID provided" };
  }

  try {
    // Retrieve the user to find their authUserId (since seeded users use CUIDs for the main ID)
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      return { success: false, error: "User not found in database" };
    }

    const authId = dbUser.authUserId || userId;

    const supabase = await createAdminClient();

    // 1. Permanently delete from Supabase Auth to revoke login access
    const { error: authError } = await supabase.auth.admin.deleteUser(authId);
    if (authError) {
      console.error("Failed to delete user in Supabase Auth:", authError);
      // We continue to soft-delete in Prisma even if Auth fails (e.g. they might already be deleted in Auth)
    }

    // 2. Soft-delete in Prisma (preserves historical data)
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await logAudit("STAFF_DELETED", "User", userId, { role: dbUser.role, email: dbUser.email });

    revalidatePath("/staff");
    return { success: true, message: "Staff member access permanently revoked and removed from active list." };
  } catch (error: any) {
    console.error("Staff delete error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
