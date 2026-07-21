import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HomeoCare Pro database...");

  // 1. Clinic
  const clinic = await prisma.clinic.upsert({
    where: { registrationNumber: "HC-PUNE-2024" },
    update: {},
    create: {
      name: "HomeoCare Pro",
      registrationNumber: "HC-PUNE-2024",
      gstin: "27AABCH1234F1Z5",
      phone: "+91 20 4102 2020",
      email: "admin@homeocare.in",
      timezone: "Asia/Kolkata",
      language: "en",
    },
  });
  console.log(`  ✓ Clinic: ${clinic.name}`);

  // 2. Branch
  const branch = await prisma.branch.upsert({
    where: { clinicId_code: { clinicId: clinic.id, code: "NAVGAON" } },
    update: {},
    create: {
      clinicId: clinic.id,
      name: "Navgaon Clinic",
      code: "NAVGAON",
      phone: "+91 20 4102 2020",
      email: "navgaon@homeocare.in",
      address: "Navgaon is a village located in the Paithan Sub-District of Chhatrapati Sambhajinagar",
      city: "Chhatrapati Sambhajinagar",
      state: "Maharashtra",
      postalCode: "431107",
    },
  });
  console.log(`  ✓ Branch: ${branch.name}`);

  // 3. Users
  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@homeocare.in" },
    update: {},
    create: {
      clinicId: clinic.id,
      role: "DOCTOR",
      firstName: "Madhukar",
      lastName: "Takpire",
      email: "doctor@homeocare.in",
      mobile: "+91 98201 00001",
    },
  });

  const receptionistUser = await prisma.user.upsert({
    where: { email: "reception@homeocare.in" },
    update: {},
    create: {
      clinicId: clinic.id,
      role: "RECEPTIONIST",
      firstName: "Anjali",
      lastName: "Deshmukh",
      email: "reception@homeocare.in",
      mobile: "+91 98201 00002",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@homeocare.in" },
    update: {},
    create: {
      clinicId: clinic.id,
      role: "CLINIC_ADMIN",
      firstName: "Rahul",
      lastName: "Patil",
      email: "admin@homeocare.in",
      mobile: "+91 98201 00003",
    },
  });

  const labTechUser = await prisma.user.upsert({
    where: { email: "lab@homeocare.in" },
    update: {},
    create: {
      clinicId: clinic.id,
      role: "LAB_TECHNICIAN",
      firstName: "Sanjay",
      lastName: "Kulkarni",
      email: "lab@homeocare.in",
      mobile: "+91 98201 00004",
    },
  });

  const pharmacistUser = await prisma.user.upsert({
    where: { email: "pharma@homeocare.in" },
    update: {},
    create: {
      clinicId: clinic.id,
      role: "PHARMACIST",
      firstName: "Neha",
      lastName: "Joshi",
      email: "pharma@homeocare.in",
      mobile: "+91 98201 00005",
    },
  });

  console.log(`  ✓ Users: Dr. Madhukar Takpire, Anjali Deshmukh, Rahul Patil, Sanjay Kulkarni (Lab), Neha Joshi (Pharma)`);

  // 4. Doctor profile
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      branchId: branch.id,
      registrationNo: "25705",
      qualification: "MD (Homoeopathy)",
      specialization: "Classical Homeopathy",
      consultationFee: 800,
    },
  });
  console.log(`  ✓ Doctor profile: ${doctor.registrationNo}`);

  // 5. Patients
  const patientData = [
    { firstName: "Elena", lastName: "Rodriguez", gender: "FEMALE" as const, mobile: "+91 98201 44018", email: "elena.rodriguez@example.com", disease: "Chronic Migraine", patientNumber: "PAT-2026-00892" },
    { firstName: "Marcus", lastName: "Thorne", gender: "MALE" as const, mobile: "+91 97655 18402", email: "marcus.thorne@example.com", disease: "Hypertension", patientNumber: "PAT-2026-00744" },
    { firstName: "Sarah", lastName: "Jenkins", gender: "FEMALE" as const, mobile: "+91 98904 22267", email: "sarah.jenkins@example.com", disease: "Gastritis", patientNumber: "PAT-2026-00121" },
    { firstName: "David", lastName: "Chen", gender: "MALE" as const, mobile: "+91 91580 78092", email: "david.chen@example.com", disease: "Acute Bronchitis", patientNumber: "PAT-2026-00333" },
    { firstName: "Priya", lastName: "Sharma", gender: "FEMALE" as const, mobile: "+91 94220 83761", email: "priya.sharma@example.com", disease: "Allergic Rhinitis", patientNumber: "PAT-2026-00904" },
    { firstName: "Arjun", lastName: "Malhotra", gender: "MALE" as const, mobile: "+91 99871 11529", email: "arjun.malhotra@example.com", disease: "Arthritis", patientNumber: "PAT-2026-00671" },
  ];

  const patients = [];
  for (const p of patientData) {
    const patient = await prisma.patient.upsert({
      where: { clinicId_patientNumber: { clinicId: clinic.id, patientNumber: p.patientNumber } },
      update: {},
      create: {
        clinicId: clinic.id,
        patientNumber: p.patientNumber,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        mobile: p.mobile,
        email: p.email,
        disease: p.disease,
        chiefComplaint: p.disease,
      },
    });
    patients.push(patient);
  }
  console.log(`  ✓ Patients: ${patients.length} seeded`);

  // 6. Appointments (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const times = [10.5, 11.25, 14, 16.5];
  const reasons = ["Arthritis follow-up", "Allergic rhinitis", "Blood pressure review", "Migraine consultation"];
  const statuses = ["CONFIRMED", "WAITING", "SCHEDULED", "CONFIRMED"] as const;
  const aptPatients = [patients[5], patients[4], patients[1], patients[0]];

  for (let i = 0; i < 4; i++) {
    const scheduledAt = new Date(today);
    scheduledAt.setHours(Math.floor(times[i]), (times[i] % 1) * 60, 0, 0);
    await prisma.appointment.upsert({
      where: { branchId_appointmentNumber: { branchId: branch.id, appointmentNumber: `APT-104${2 + i}` } },
      update: {},
      create: {
        branchId: branch.id,
        patientId: aptPatients[i].id,
        doctorId: doctor.id,
        appointmentNumber: `APT-104${2 + i}`,
        scheduledAt,
        status: statuses[i],
        reason: reasons[i],
        mode: i === 1 || i === 3 ? "VIDEO" : "CLINIC",
      },
    });
  }
  console.log(`  ✓ Appointments: 4 seeded for today`);

  // 7. Inventory
  const meds = [
    { name: "Arnica Montana", potency: "30C", manufacturer: "SBL", batch: "ARN-2441", qty: 84, expiry: new Date("2028-03-01"), cost: 45 },
    { name: "Nux Vomica", potency: "200C", manufacturer: "Dr. Reckeweg", batch: "NUX-1938", qty: 12, expiry: new Date("2027-12-01"), cost: 65 },
    { name: "Belladonna", potency: "30C", manufacturer: "Schwabe", batch: "BEL-0842", qty: 45, expiry: new Date("2026-09-01"), cost: 40 },
    { name: "Rhus Toxicodendron", potency: "1M", manufacturer: "SBL", batch: "RHU-5540", qty: 67, expiry: new Date("2029-01-01"), cost: 55 },
    { name: "Pulsatilla", potency: "30C", manufacturer: "Bakson", batch: "PUL-8812", qty: 8, expiry: new Date("2027-06-01"), cost: 38 },
  ];

  for (const med of meds) {
    await prisma.inventoryItem.upsert({
      where: { branchId_batchNumber: { branchId: branch.id, batchNumber: med.batch } },
      update: {},
      create: {
        clinicId: clinic.id,
        branchId: branch.id,
        medicineName: med.name,
        potency: med.potency,
        manufacturer: med.manufacturer,
        batchNumber: med.batch,
        quantity: med.qty,
        expiryDate: med.expiry,
        unitCost: med.cost,
      },
    });
  }
  console.log(`  ✓ Inventory: ${meds.length} medicines stocked`);

  // 8. Sample invoices
  const invoiceData = [
    { patient: patients[0], amount: 2450, method: "UPI", status: "PAID" as const },
    { patient: patients[1], amount: 1800, method: "CASH", status: "PAID" as const },
    { patient: patients[2], amount: 3250, method: "CREDIT_CARD", status: "PENDING" as const },
    { patient: patients[3], amount: 1200, method: "UPI", status: "OVERDUE" as const },
  ];

  let invoiceCount = 425;
  for (const inv of invoiceData) {
    invoiceCount++;
    const invoiceNum = `INV-2026-0${invoiceCount}`;
    
    const invoice = await prisma.invoice.upsert({
      where: { invoiceNumber: invoiceNum },
      update: {},
      create: {
        clinicId: clinic.id,
        branchId: branch.id,
        patientId: inv.patient.id,
        invoiceNumber: invoiceNum,
        consultationFee: 800,
        medicineCharges: inv.amount - 800,
        total: inv.amount,
        status: inv.status,
      },
    });

    if (inv.status === "PAID") {
      const existingPayment = await prisma.payment.findFirst({
        where: { invoiceId: invoice.id }
      });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: inv.amount,
            method: inv.method as any,
          },
        });
      }
    }
  }
  console.log(`  ✓ Invoices: 4 created with payments`);

  // 9. Follow-ups
  const followUpData = [
    { patient: patients[0], dueAt: new Date(Date.now() + 6 * 86400000), status: "UPCOMING" as const },
    { patient: patients[1], dueAt: new Date(), status: "DUE" as const },
    { patient: patients[4], dueAt: new Date(Date.now() + 8 * 86400000), status: "UPCOMING" as const },
    { patient: patients[5], dueAt: new Date(Date.now() + 4 * 86400000), status: "UPCOMING" as const },
    { patient: patients[2], dueAt: new Date(Date.now() - 2 * 86400000), status: "OVERDUE" as const },
    { patient: patients[3], dueAt: new Date(Date.now() - 1 * 86400000), status: "OVERDUE" as const },
    { patient: patients[0], dueAt: new Date(Date.now() + 14 * 86400000), status: "UPCOMING" as const },
  ];

  for (const fu of followUpData) {
    await prisma.followUp.create({
      data: {
        patientId: fu.patient.id,
        dueAt: fu.dueAt,
        status: fu.status,
      },
    });
  }
  console.log(`  ✓ Follow-ups: ${followUpData.length} scheduled`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
