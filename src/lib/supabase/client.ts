"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase browser client is missing public environment variables.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

