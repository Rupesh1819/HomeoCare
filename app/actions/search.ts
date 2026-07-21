"use server";

import { prisma } from "@/lib/prisma";

export async function searchPatients(query: string) {
  if (!query || query.trim() === "") {
    return [];
  }
  
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return [];

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: clinic.id,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { patientNumber: { contains: query, mode: "insensitive" } },
        { mobile: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  return patients.map(p => ({
    id: p.patientNumber,
    dbId: p.id,
    name: `${p.firstName} ${p.lastName}`,
    patientNumber: p.patientNumber,
    mobile: p.mobile || "",
  }));
}
