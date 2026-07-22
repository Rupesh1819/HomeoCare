import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing dummy staff members...");

  // Delete all users except Dr. Takpire (doctor@homeocare.in)
  const result = await prisma.user.deleteMany({
    where: {
      email: {
        not: "doctor@homeocare.in" // Keep the main doctor/owner account
      }
    }
  });

  console.log(`✅ Deleted ${result.count} dummy staff members.`);
  console.log("Only Dr. Takpire remains in the system.");
}

main()
  .catch((e) => {
    console.error("❌ Error clearing staff:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
