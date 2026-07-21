import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const inactiveUsers = await prisma.user.findMany({
    where: { isActive: false }
  });

  console.log(`Found ${inactiveUsers.length} inactive users to delete physically.`);

  for (const u of inactiveUsers) {
    console.log(`Deleting ${u.email}...`);
    // Delete from Supabase Auth
    if (u.authUserId) {
      const { error } = await supabase.auth.admin.deleteUser(u.authUserId);
      if (error) {
        console.error(`Failed to delete from Supabase Auth: ${error.message}`);
      } else {
        console.log(`Deleted from Supabase Auth: ${u.email}`);
      }
    }

    // Delete from Prisma
    await prisma.user.delete({
      where: { id: u.id }
    });
    console.log(`Deleted from Prisma: ${u.email}`);
  }

  console.log("Cleanup complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
