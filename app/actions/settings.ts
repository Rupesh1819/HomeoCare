"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Fallback for when there's no auth, just grab the doctor/owner
    const owner = await prisma.user.findFirst({ where: { email: "doctor@bhagavaticlinic.in" } });
    return {
      id: owner?.id || "",
      firstName: owner?.firstName || "",
      lastName: owner?.lastName || "",
      mobile: owner?.mobile || "",
      role: owner?.role || "SUPER_ADMIN", // Ensure owner has max privileges
    };
  }

  let dbUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
  });

  // If not found by authUserId (seeded users), fall back to email and link them
  if (!dbUser && user.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (dbUser) {
      // Link the auth user ID for future lookups
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { authUserId: user.id },
      });
    }
  }

  const isOwner = dbUser?.email === "doctor@bhagavaticlinic.in";

  return {
    id: dbUser?.id || "",
    firstName: dbUser?.firstName || "",
    lastName: dbUser?.lastName || "",
    mobile: dbUser?.mobile || "",
    role: isOwner ? "SUPER_ADMIN" : (dbUser?.role || "CLINIC_ADMIN"),
  };
}

export async function updateAdminProfile(data: { id: string; firstName: string; lastName: string; mobile: string }) {
  if (!data.id) throw new Error("No user ID provided.");
  
  await prisma.user.update({
    where: { id: data.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
    },
  });

  await logAudit("PROFILE_UPDATED", "User", data.id, { name: `${data.firstName} ${data.lastName}` });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

export async function getClinicSettings() {
  let clinic = await prisma.clinic.findFirst({
    include: {
      branches: true,
    },
  });

  // If no clinic exists (e.g. clean DB), create a default one
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: "Bhagwati Clinic",
        registrationNumber: "MH-HOM-2024-1842",
        gstin: "27AABCH1842F1Z8",
        phone: "+91 20 4102 2020",
        email: "care@bhagavaticlinic.in",
        timezone: "Asia/Kolkata",
        language: "en",
        branches: {
          create: {
            name: "Navgaon Clinic",
            code: "PUNE-HQ",
            phone: "+91 20 4102 2020",
            email: "care@bhagavaticlinic.in",
            address: "Navgaon is a village located in the Paithan Sub-District of Chhatrapati Sambhajinagar",
            city: "Pune",
            state: "Maharashtra",
          },
        },
      },
      include: {
        branches: true,
      },
    });
  }

  return {
    id: clinic.id,
    name: clinic.name,
    registrationNumber: clinic.registrationNumber || "",
    gstin: clinic.gstin || "",
    phone: clinic.phone || "",
    email: clinic.email || "",
    logoUrl: clinic.logoUrl || "",
    language: clinic.language,
    branchName: clinic.branches[0]?.name || "Navgaon Clinic",
    branchCity: clinic.branches[0]?.city || "Pune",
    branchState: clinic.branches[0]?.state || "Maharashtra",
  };
}

export async function updateClinicSettings(data: {
  name: string;
  registrationNumber: string;
  gstin: string;
  phone: string;
  email: string;
  language: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    throw new Error("No clinic found to update.");
  }

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      name: data.name,
      registrationNumber: data.registrationNumber || null,
      gstin: data.gstin || null,
      phone: data.phone || null,
      email: data.email || null,
      language: data.language,
    },
  });

  await logAudit("SETTINGS_UPDATED", "Clinic", clinic.id, { name: data.name });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
