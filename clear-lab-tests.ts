import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing dummy lab tests and lab orders...");

  const ordersResult = await prisma.labOrder.deleteMany({});
  console.log(`  ✓ Deleted ${ordersResult.count} lab orders`);

  const testsResult = await prisma.labTest.deleteMany({});
  console.log(`  ✓ Deleted ${testsResult.count} lab test master records`);

  console.log("✅ Lab Test Master and Lab Orders cleared completely!");
}

main()
  .catch((e) => {
    console.error("❌ Error clearing lab tests:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
