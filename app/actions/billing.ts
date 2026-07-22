"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { PaymentMethod } from "@prisma/client";

export async function getInvoices(query?: string) {
  const where: any = {};

  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { patient: { firstName: { contains: q, mode: "insensitive" } } },
      { patient: { lastName: { contains: q, mode: "insensitive" } } },
      { patient: { patientNumber: { contains: q, mode: "insensitive" } } },
      { patient: { mobile: { contains: q, mode: "insensitive" } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      patient: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return invoices.map((inv: any) => ({
    id: inv.invoiceNumber,
    dbId: inv.id,
    patientId: inv.patient.id,
    patientNumber: inv.patient.patientNumber,
    patient: `${inv.patient.firstName} ${inv.patient.lastName}`,
    date: inv.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    consultationFee: Number(inv.consultationFee),
    medicineCharges: Number(inv.medicineCharges),
    labCharges: Number(inv.labCharges || 0),
    totalAmountNum: Number(inv.total),
    amount: `₹${Number(inv.total).toLocaleString("en-IN")}`,
    method: inv.payments.length > 0 ? inv.payments[0].method : "CASH",
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
  patientId?: string;
  patientName?: string;
  consultationFee: number;
  medicineCharges: number;
  labCharges?: number;
  paymentMethod?: PaymentMethod;
  status?: "PAID" | "PENDING";
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");
  const branch = await prisma.branch.findFirst({ where: { clinicId: clinic.id } });
  if (!branch) throw new Error("No branch found.");

  let patient = null;

  if (data.patientId) {
    patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  }

  if (!patient && data.patientName) {
    const nameParts = data.patientName.trim().split(" ");
    patient = await prisma.patient.findFirst({
      where: {
        clinicId: clinic.id,
        firstName: { equals: nameParts[0], mode: "insensitive" },
      },
    });
  }

  if (!patient) throw new Error("Please select a valid patient.");

  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const labCharges = data.labCharges || 0;
  const total = (data.consultationFee || 0) + (data.medicineCharges || 0) + labCharges;
  const initialStatus = data.status || "PENDING";

  const invoice = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      branchId: branch.id,
      patientId: patient.id,
      invoiceNumber,
      consultationFee: data.consultationFee || 0,
      medicineCharges: data.medicineCharges || 0,
      labCharges,
      total,
      status: initialStatus,
    },
  });

  if (initialStatus === "PAID") {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: total,
        method: data.paymentMethod || "CASH",
      },
    });
  }

  await logAudit("INVOICE_GENERATED", "Invoice", invoice.id, { 
    invoiceNumber, 
    patientName: `${patient.firstName} ${patient.lastName}`,
    amount: total 
  });

  revalidatePath("/billing");
  revalidatePath("/patients");
  return invoice;
}

export async function recordPayment(invoiceDbId: string, method: PaymentMethod = "CASH") {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceDbId },
    include: { patient: true },
  });

  if (!invoice) throw new Error("Invoice not found");

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: invoice.total,
      method,
    },
  });

  await prisma.invoice.update({
    where: { id: invoiceDbId },
    data: { status: "PAID" },
  });

  await logAudit("PAYMENT_RECORDED", "Invoice", invoice.id, {
    invoiceNumber: invoice.invoiceNumber,
    method,
    amount: Number(invoice.total),
  });

  revalidatePath("/billing");
  revalidatePath("/patients");
}

export async function deleteInvoice(invoiceDbId: string) {
  await prisma.payment.deleteMany({
    where: { invoiceId: invoiceDbId },
  });

  await prisma.invoice.delete({
    where: { id: invoiceDbId },
  });

  await logAudit("INVOICE_DELETED", "Invoice", invoiceDbId, {});

  revalidatePath("/billing");
}
