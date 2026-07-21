import { createClient } from "@supabase/supabase-js";

async function setupAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  console.log("Setting up Supabase Auth users...");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const usersToCreate = [
    { email: "doctor@homeocare.in", password: "homeocare" },
    { email: "admin@homeocare.in", password: "homeocare" },
    { email: "reception@homeocare.in", password: "homeocare" },
  ];

  for (const user of usersToCreate) {
    console.log(`Checking if ${user.email} exists in Auth...`);
    
    // Create the user in Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes("already registered") || error.code === "email_exists") {
        console.log(`  -> User ${user.email} already exists in Auth. Skipping.`);
      } else {
        console.error(`  -> Failed to create user ${user.email}:`, error.message);
      }
    } else {
      console.log(`  -> Successfully created Auth user: ${user.email}`);
    }
  }

  console.log("Auth setup complete!");
}

setupAuth();
