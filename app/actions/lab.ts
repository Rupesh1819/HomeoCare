"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";

export type LabTestInput = {
  name: string;
  category: string;
  price: number;
  description?: string;
  active?: boolean;
};

const DEFAULT_LAB_TESTS = [
  { name: "CBC (Complete Blood Count)", category: "Blood Tests", price: 250, description: "Includes RBC, WBC, Hemoglobin, Platelets & differential counts" },
  { name: "Blood Sugar Fasting", category: "Blood Tests", price: 150, description: "Fasting plasma glucose test (8-10 hours fasting required)" },
  { name: "HbA1c", category: "Blood Tests", price: 450, description: "Glycated Hemoglobin test for 3-month average blood sugar" },
  { name: "LFT (Liver Function Test)", category: "Blood Tests", price: 600, description: "Bilirubin, SGOT, SGPT, Alkaline Phosphatase, Protein" },
  { name: "KFT (Kidney Function Test)", category: "Blood Tests", price: 550, description: "Serum Creatinine, Blood Urea, Uric Acid, Electrolytes" },
  { name: "Thyroid Profile (T3, T4, TSH)", category: "Blood Tests", price: 500, description: "Total T3, Total T4, and Thyroid Stimulating Hormone" },
  { name: "Urine Routine & Microscopy", category: "Urine Tests", price: 120, description: "Physical, chemical, and microscopic urine analysis" },
  { name: "X-Ray Chest PA View", category: "Radiology", price: 350, description: "Standard Chest Radiograph PA View" },
  { name: "ECG 12 Lead", category: "Cardiology", price: 300, description: "Resting 12-lead Electrocardiogram" },
];

export async function seedDefaultLabTests() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");

  const existingCount = await prisma.labTest.count({ where: { clinicId: clinic.id } });
  if (existingCount > 0) return;

  for (const test of DEFAULT_LAB_TESTS) {
    await prisma.labTest.create({
      data: {
        clinicId: clinic.id,
        name: test.name,
        category: test.category,
        price: test.price,
        description: test.description,
        active: true,
      },
    });
  }

  revalidatePath("/lab-master");
}

export async function getLabTests(category?: string) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return [];

  // Auto seed if empty
  const count = await prisma.labTest.count({ where: { clinicId: clinic.id } });
  if (count === 0) {
    await seedDefaultLabTests();
  }

  const where: any = { clinicId: clinic.id };
  if (category && category !== "All") {
    where.category = category;
  }

  const tests = await prisma.labTest.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return tests.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    price: Number(t.price),
    description: t.description || "",
    active: t.active,
    createdAt: t.createdAt.toISOString(),
  }));
}

export async function createLabTest(data: LabTestInput) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");

  if (!data.name.trim()) throw new Error("Test name is required.");

  const labTest = await prisma.labTest.create({
    data: {
      clinicId: clinic.id,
      name: data.name.trim(),
      category: data.category || "Blood Tests",
      price: data.price || 0,
      description: data.description?.trim(),
      active: data.active ?? true,
    },
  });

  await logAudit("LAB_TEST_CREATED", "LabTest", labTest.id, { name: labTest.name, price: data.price });

  revalidatePath("/lab-master");
  revalidatePath("/prescriptions");
  return labTest;
}

export async function updateLabTest(id: string, data: Partial<LabTestInput>) {
  const labTest = await prisma.labTest.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.category ? { category: data.category } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });

  await logAudit("LAB_TEST_UPDATED", "LabTest", labTest.id, { name: labTest.name });

  revalidatePath("/lab-master");
  revalidatePath("/prescriptions");
  return labTest;
}

export async function deleteLabTest(id: string) {
  await prisma.labTest.delete({
    where: { id },
  });

  await logAudit("LAB_TEST_DELETED", "LabTest", id, {});

  revalidatePath("/lab-master");
  revalidatePath("/prescriptions");
}

export async function toggleLabTestStatus(id: string, active: boolean) {
  await prisma.labTest.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/lab-master");
  revalidatePath("/prescriptions");
}

export async function getLabOrders(filters?: {
  status?: string;
  search?: string;
  todayOnly?: boolean;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return [];

  const where: any = { clinicId: clinic.id };

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.todayOnly) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    where.orderedAt = { gte: startOfDay, lte: endOfDay };
  }

  if (filters?.search) {
    const s = filters.search.trim();
    where.OR = [
      { patient: { firstName: { contains: s, mode: "insensitive" } } },
      { patient: { lastName: { contains: s, mode: "insensitive" } } },
      { patient: { patientNumber: { contains: s, mode: "insensitive" } } },
      { patient: { mobile: { contains: s, mode: "insensitive" } } },
      { labTest: { name: { contains: s, mode: "insensitive" } } },
      { doctor: { firstName: { contains: s, mode: "insensitive" } } },
      { doctor: { lastName: { contains: s, mode: "insensitive" } } },
      { prescription: { prescriptionNo: { contains: s, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.labOrder.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
      labTest: true,
      prescription: true,
    },
    orderBy: { orderedAt: "desc" },
    take: 100,
  });

  return orders.map((o) => ({
    id: o.id,
    patientId: o.patientId,
    patientName: `${o.patient.firstName} ${o.patient.lastName}`,
    patientNumber: o.patient.patientNumber,
    mobile: o.patient.mobile,
    doctorName: `Dr. ${o.doctor.firstName} ${o.doctor.lastName}`,
    testName: o.labTest.name,
    category: o.labTest.category,
    price: Number(o.labTest.price),
    prescriptionNo: o.prescription?.prescriptionNo || `VISIT-${o.id.slice(-6).toUpperCase()}`,
    status: o.status,
    notes: o.notes || "",
    reportUrl: o.reportUrl || null,
    reportStoragePath: o.reportStoragePath || null,
    uploadedBy: o.uploadedBy || null,
    orderedAt: o.orderedAt.toISOString(),
    formattedDate: o.orderedAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    completedAt: o.completedAt ? o.completedAt.toISOString() : null,
  }));
}

export async function updateLabOrderStatus(orderId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  const data: any = { status };
  if (status === "COMPLETED") {
    data.completedAt = new Date();
  }

  const order = await prisma.labOrder.update({
    where: { id: orderId },
    data,
  });

  await logAudit("LAB_ORDER_STATUS_UPDATED", "LabOrder", order.id, { status });

  revalidatePath("/lab-dashboard");
  revalidatePath("/patients");
  revalidatePath("/prescriptions");
  return order;
}

export async function uploadLabReport(formData: FormData) {
  const file = formData.get("file") as File;
  const orderId = formData.get("orderId") as string;
  const notes = (formData.get("notes") as string) || "";
  const uploadedBy = (formData.get("uploadedBy") as string) || "Lab Assistant";

  if (!orderId) {
    return { success: false, error: "No Lab Order ID provided" };
  }

  const order = await prisma.labOrder.findUnique({
    where: { id: orderId },
    include: { patient: true, labTest: true },
  });

  if (!order) {
    return { success: false, error: "Lab Order not found" };
  }

  if (!file || file.size === 0) {
    // If completing without a file upload
    await prisma.labOrder.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        notes: notes ? `${order.notes ? order.notes + " | " : ""}${notes}` : order.notes,
        uploadedBy,
        completedAt: new Date(),
      },
    });

    revalidatePath("/lab-dashboard");
    revalidatePath("/patients");
    return { success: true, message: "Status updated to Completed" };
  }

  const filename = file.name;
  const mimeType = file.type;
  const sizeBytes = file.size;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDemoMode =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key");

  let storagePath = `lab-reports/${order.patientId}/${Date.now()}_${filename}`;
  let reportUrl = "#";

  if (!isDemoMode) {
    try {
      const supabase = await createAdminClient();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from("reports")
        .createSignedUrl(storagePath, 86400 * 365); // 1 year

      reportUrl = signedData?.signedUrl || "#";
    } catch (err: any) {
      console.error("Storage upload failed, falling back to database metadata:", err);
    }
  } else {
    reportUrl = `/demo-report-${filename}`;
  }

  // Create MedicalReport record
  const medicalReport = await prisma.medicalReport.create({
    data: {
      patientId: order.patientId,
      category: order.labTest.category || "Lab Report",
      title: `${order.labTest.name} Report`,
      storagePath,
      mimeType,
      sizeBytes: BigInt(sizeBytes),
      uploadedBy,
    },
  });

  // Update LabOrder
  await prisma.labOrder.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      reportUrl,
      reportStoragePath: storagePath,
      uploadedBy,
      notes: notes ? `${order.notes ? order.notes + " | " : ""}${notes}` : order.notes,
      completedAt: new Date(),
    },
  });

  await logAudit("LAB_REPORT_UPLOADED", "LabOrder", order.id, {
    testName: order.labTest.name,
    patientId: order.patientId,
  });

  revalidatePath("/lab-dashboard");
  revalidatePath("/patients");
  revalidatePath("/prescriptions");

  return { success: true, reportUrl };
}

export async function getPatientLabOrders(patientId: string) {
  const orders = await prisma.labOrder.findMany({
    where: { patientId },
    include: {
      doctor: true,
      labTest: true,
    },
    orderBy: { orderedAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    testName: o.labTest.name,
    category: o.labTest.category,
    price: Number(o.labTest.price),
    doctorName: `Dr. ${o.doctor.firstName} ${o.doctor.lastName}`,
    status: o.status,
    notes: o.notes || "",
    reportUrl: o.reportUrl || null,
    reportStoragePath: o.reportStoragePath || null,
    orderedAt: o.orderedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    completedAt: o.completedAt
      ? o.completedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null,
  }));
}
