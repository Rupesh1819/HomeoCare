"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function uploadReport(formData: FormData) {
  const file = formData.get("file") as File;
  const patientId = formData.get("patientId") as string;
  const category = (formData.get("category") as string) || "Other";
  const uploadedBy = (formData.get("uploadedBy") as string) || "Dr. Maya Smith";

  if (!file) {
    return { success: false, error: "No file provided" };
  }
  
  if (!patientId) {
    return { success: false, error: "No patient selected" };
  }

  const filename = file.name;
  const mimeType = file.type;
  const sizeBytes = file.size;
  const extension = filename.split(".").pop()?.toUpperCase() || "PDF";

  // Check if Supabase keys are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDemoMode =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key");

  if (isDemoMode) {
    // Return simulated success for demo mode
    return {
      success: true,
      demo: true,
      report: {
        name: filename,
        patient: "Elena Rodriguez",
        category,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        type: extension,
      },
    };
  }

  try {
    const supabase = await createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to private bucket 'reports'
    const storagePath = `${patientId}/${Date.now()}_${filename}`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Save metadata in database via Prisma
    const dbReport = await prisma.medicalReport.create({
      data: {
        patientId,
        category,
        title: filename,
        storagePath,
        mimeType,
        sizeBytes: BigInt(sizeBytes),
        uploadedBy,
      },
    });

    await logAudit("REPORT_UPLOADED", "MedicalReport", dbReport.id, { filename, category, patientId });

    // Generate a secure temporary signed URL for viewing (expires in 1 hour)
    const { data: signedUrlData } = await supabase.storage
      .from("reports")
      .createSignedUrl(storagePath, 3600);

    return {
      success: true,
      demo: false,
      report: {
        id: dbReport.id,
        name: dbReport.title,
        patient: "Patient Record",
        category: dbReport.category,
        date: dbReport.createdAt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        type: extension,
        url: signedUrlData?.signedUrl || null,
      },
    };
  } catch (err: any) {
    console.error("Upload failed:", err);
    return { success: false, error: err.message || "Upload operation failed" };
  }
}

export async function getReports(query?: string) {
  const where: any = {};
  
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { category: { contains: query, mode: "insensitive" } },
      { patient: { firstName: { contains: query, mode: "insensitive" } } },
      { patient: { lastName: { contains: query, mode: "insensitive" } } },
    ];
  }

  const reports = await prisma.medicalReport.findMany({
    where,
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDemoMode =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key");

  let signedUrlsMap: Record<string, string> = {};
  if (!isDemoMode && reports.length > 0) {
    try {
      const supabase = await createAdminClient();
      const paths = reports.map((r) => r.storagePath);
      const { data, error } = await supabase.storage.from("reports").createSignedUrls(paths, 3600);
      if (!error && data) {
        data.forEach((item) => {
          if (item.signedUrl && item.path) {
            signedUrlsMap[item.path] = item.signedUrl;
          }
        });
      }
    } catch (err) {
      console.error("Failed to generate signed URLs for reports:", err);
    }
  }

  return reports.map((r) => ({
    id: r.id,
    name: r.title,
    patient: `${r.patient.firstName} ${r.patient.lastName}`,
    category: r.category,
    date: r.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    type: r.mimeType.split("/").pop()?.toUpperCase() || "FILE",
    url: signedUrlsMap[r.storagePath] || "#",
    storagePath: r.storagePath,
  }));
}

export async function getSecureReportUrl(storagePath: string, download: boolean = false) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.storage
      .from("reports")
      .createSignedUrl(storagePath, 3600, { download });

    if (error || !data) {
      console.error("Failed to generate signed URL:", error);
      return { success: false, error: "Failed to generate secure link." };
    }

    return { success: true, url: data.signedUrl };
  } catch (err: any) {
    console.error("Exception getting secure URL:", err);
    return { success: false, error: err.message };
  }
}

export async function uploadClinicLogo(formData: FormData) {
  const file = formData.get("file") as File;
  
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const filename = file.name;
  const mimeType = file.type;

  // Check if Supabase keys are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDemoMode =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key");

  if (isDemoMode) {
    return { success: false, error: "Cannot upload logo in demo mode. Please configure Supabase." };
  }

  try {
    const supabase = await createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to public bucket 'public-assets'
    const storagePath = `clinic/logo_${Date.now()}_${filename}`;
    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("public-assets")
      .getPublicUrl(storagePath);
      
    const publicUrl = publicUrlData.publicUrl;

    // Update database
    const clinic = await prisma.clinic.findFirst();
    if (clinic) {
      await prisma.clinic.update({
        where: { id: clinic.id },
        data: { logoUrl: publicUrl },
      });
      await logAudit("SETTINGS_UPDATED", "Clinic", clinic.id, { logoUpdated: true });
    }

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("Logo upload failed:", err);
    return { success: false, error: err.message || "Upload failed" };
  }
}
