"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";

export async function login(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Missing Supabase configuration" };
  }

  const getSupabaseClient = () =>
    createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore cookie setting errors in server components
          }
        },
      },
    });

  let supabase = getSupabaseClient();

  // 1. Try standard authentication
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. If login fails, check if the account exists in Prisma DB and auto-provision / sync password in Supabase Auth
  if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

      if (dbUser) {
        const adminSupabase = await createAdminClient();
        const { data: usersData } = await adminSupabase.auth.admin.listUsers();
        const existingAuthUser = usersData?.users?.find(
          (u: any) => u.email?.toLowerCase() === email
        );

        if (existingAuthUser) {
          // Sync password to Supabase Auth
          await adminSupabase.auth.admin.updateUserById(existingAuthUser.id, {
            password,
            email_confirm: true,
          });
        } else {
          // Create missing user in Supabase Auth
          const { data: newAuthUser } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { firstName: dbUser.firstName, lastName: dbUser.lastName },
          });

          if (newAuthUser?.user?.id) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { authUserId: newAuthUser.user.id },
            });
          }
        }

        // Retry authentication with fresh session
        supabase = getSupabaseClient();
        const retryResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!retryResult.error) {
          return { success: true };
        }
      }
    } catch (provisionErr) {
      console.error("[auth] Auto-provisioning notice:", provisionErr);
    }
  }

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
