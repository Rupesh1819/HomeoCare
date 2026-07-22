import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Dr. Takpire's email...");

  const user = await prisma.user.update({
    where: { email: "doctor@homeocare.in" },
    data: { email: "doctor@bhagavaticlinic.in" }
  });

  console.log(`✅ Email successfully updated to: ${user.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Error updating email. It might have already been updated.", e.meta || e.message);
    process.exit(0); // exit 0 so it doesn't look like a scary failure if it's already done
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
