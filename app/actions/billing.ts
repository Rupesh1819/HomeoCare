"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function getInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: {
      patient: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return invoices.map((inv) => ({
    id: inv.invoiceNumber,
    dbId: inv.id,
    patient: `${inv.patient.firstName} ${inv.patient.lastName}`,
    date: inv.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    amount: `₹${Number(inv.total).toLocaleString("en-IN")}`,
    method: inv.payments.length > 0 ? inv.payments[0].method : "-",
    status: inv.status === "PAID" ? "Paid" : inv.status === "PENDING" ? "Pending" : "Overdue",
  }));
}

export async function getBillingStats() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayInvoices, monthInvoices, pendingInvoices, overdueInvoices] = await Promise.all([
    prisma.invoice.findMany({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
    prisma.invoice.findMany({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.invoice.findMany({ where: { status: "PENDING" } }),
    prisma.invoice.findMany({ where: { status: "OVERDUE" } }),
  ]);

  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const monthRevenue = monthInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return {
    todayRevenue: formatCurrency(todayRevenue),
    monthRevenue: formatCurrency(monthRevenue),
    pendingTotal: formatCurrency(pendingTotal),
    pendingCount: pendingInvoices.length,
    overdueTotal: formatCurrency(overdueTotal),
    overdueCount: overdueInvoices.length,
  };
}

export async function createInvoice(data: {
  patientName: string;
  consultationFee: number;
  medicineCharges: number;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");
  const branch = await prisma.branch.findFirst({ where: { clinicId: clinic.id } });
  if (!branch) throw new Error("No branch found.");

  const nameParts = data.patientName.trim().split(" ");
  const patient = await prisma.patient.findFirst({
    where: {
      clinicId: clinic.id,
      firstName: { equals: nameParts[0], mode: "insensitive" },
    },
  });
  if (!patient) throw new Error("Patient not found.");

  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      branchId: branch.id,
      patientId: patient.id,
      invoiceNumber,
      consultationFee: data.consultationFee,
      medicineCharges: data.medicineCharges,
      total: data.consultationFee + data.medicineCharges,
      status: "PENDING",
    },
  });

  await logAudit("INVOICE_GENERATED", "Invoice", invoice.id, { 
    invoiceNumber, 
    patientName: data.patientName,
    amount: data.consultationFee + data.medicineCharges 
  });

  revalidatePath("/billing");
}
