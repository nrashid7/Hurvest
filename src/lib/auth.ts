import { redirect } from "next/navigation";
import { demoProfiles } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoProfiles[0];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile | null) ?? null;
}

export async function requireRole(roles: UserRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect("/account");
  return profile;
}

export function isAdmin(profile: Profile | null) {
  return profile?.role === "admin";
}

export function isFarmer(profile: Profile | null) {
  return profile?.role === "farmer" || profile?.role === "admin";
}

