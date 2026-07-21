"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventory(query?: string) {
  const where: any = {};
  if (query) {
    where.OR = [
      { medicineName: { contains: query, mode: "insensitive" } },
      { batchNumber: { contains: query, mode: "insensitive" } },
      { manufacturer: { contains: query, mode: "insensitive" } },
    ];
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { medicineName: "asc" },
    take: 100,
  });

  return items.map((item) => {
    const now = new Date();
    const daysToExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / 86400000);
    let status: string;
    if (item.quantity <= 10) status = "Low stock";
    else if (daysToExpiry <= 90) status = "Expiring";
    else status = "In stock";

    return {
      id: item.id,
      medicine: item.medicineName,
      potency: item.potency || "",
      manufacturer: item.manufacturer || "",
      batch: item.batchNumber,
      stock: item.quantity,
      expiry: item.expiryDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      status,
    };
  });
}

export async function getInventoryStats() {
  const items = await prisma.inventoryItem.findMany();
  const now = new Date();
  const in90Days = new Date(now);
  in90Days.setDate(in90Days.getDate() + 90);

  const totalMedicines = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = items.filter((item) => item.quantity <= 10).length;
  const expiringSoon = items.filter((item) => item.expiryDate <= in90Days && item.expiryDate > now).length;
  const stockValue = items.reduce((sum, item) => sum + item.quantity * Number(item.unitCost || 0), 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return { totalMedicines, totalUnits, lowStock, expiringSoon, stockValue: formatCurrency(stockValue) };
}

export async function addInventoryItem(data: {
  medicineName: string;
  potency: string;
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  unitCost: number;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found.");
  const branch = await prisma.branch.findFirst({ where: { clinicId: clinic.id } });
  if (!branch) throw new Error("No branch found.");

  await prisma.inventoryItem.create({
    data: {
      clinicId: clinic.id,
      branchId: branch.id,
      medicineName: data.medicineName,
      potency: data.potency,
      manufacturer: data.manufacturer,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      expiryDate: new Date(data.expiryDate),
      unitCost: data.unitCost,
    },
  });

  revalidatePath("/inventory");
}

export async function updateInventoryItem(dbId: string, data: Partial<{
  medicineName: string;
  potency: string;
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  unitCost: number;
}>) {
  const updateData: any = { ...data };
  if (data.expiryDate) {
    updateData.expiryDate = new Date(data.expiryDate);
  }

  await prisma.inventoryItem.update({
    where: { id: dbId },
    data: updateData,
  });

  revalidatePath("/inventory");
}
