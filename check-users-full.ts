import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });
  console.log("Users in DB:", users);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
