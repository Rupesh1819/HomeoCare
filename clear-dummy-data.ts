import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing dummy records...");

  // Delete all relational data attached to patients
  await prisma.payment.deleteMany();
  console.log("  ✓ Payments deleted");
  
  await prisma.invoice.deleteMany();
  console.log("  ✓ Invoices deleted");
  
  await prisma.followUp.deleteMany();
  console.log("  ✓ Follow-ups deleted");
  
  await prisma.vitals.deleteMany();
  console.log("  ✓ Vitals deleted");
  
  await prisma.prescriptionItem.deleteMany();
  console.log("  ✓ Prescription items deleted");
  
  await prisma.prescription.deleteMany();
  console.log("  ✓ Prescriptions deleted");
  
  await prisma.treatment.deleteMany();
  console.log("  ✓ Treatments deleted");
  
  await prisma.appointment.deleteMany();
  console.log("  ✓ Appointments deleted");
  
  await prisma.medicalReport.deleteMany();
  console.log("  ✓ Medical Reports deleted");

  // Delete patients themselves
  await prisma.patient.deleteMany();
  console.log("  ✓ Patients deleted");

  // Delete inventory
  await prisma.inventoryItem.deleteMany();
  console.log("  ✓ Inventory deleted");

  console.log("✅ All dummy data cleared! Clinic and Staff accounts remain intact.");
}

main()
  .catch((e) => {
    console.error("❌ Error clearing data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
