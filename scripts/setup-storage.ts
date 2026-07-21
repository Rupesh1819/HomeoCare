import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const prisma = new PrismaClient();

  try {
    console.log("Checking if 'reports' bucket exists...");
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;

    const reportsBucket = buckets.find(b => b.name === "reports");

    if (!reportsBucket) {
      console.log("Creating private 'reports' bucket...");
      const { error: createError } = await supabase.storage.createBucket("reports", {
        public: false,
        allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/webp"],
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) throw createError;
      console.log("Bucket created successfully.");
    } else {
      console.log("'reports' bucket already exists.");
    }

    console.log("Configuring Row Level Security (RLS) for storage...");

    // Execute raw SQL using Prisma to setup RLS policies on the storage.objects table
    const queries = [
      `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated selects" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;`,
      `CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');`,
      `CREATE POLICY "Allow authenticated selects" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'reports');`,
      `CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'reports');`,
      `CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reports');`
    ];

    for (const query of queries) {
      await prisma.$executeRawUnsafe(query);
    }

    console.log("Storage RLS policies configured successfully.");
    console.log("Phase 1 Complete: Medical File Storage is ready!");

  } catch (error: any) {
    console.error("Failed to setup storage:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

setupStorage();
