"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/account?demo=1");

  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address_line1: String(formData.get("address_line1") ?? ""),
      address_line2: String(formData.get("address_line2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? "MN"),
      zip: String(formData.get("zip") ?? ""),
      delivery_notes: String(formData.get("delivery_notes") ?? ""),
    })
    .eq("id", profile.id);

  revalidatePath("/account");
}

export async function setSubscriptionStatusAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const subscriptionId = String(formData.get("subscription_id") ?? "");
  const status = String(formData.get("status") ?? "paused");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/account?demo=1");

  await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", subscriptionId)
    .eq("user_id", profile.id);

  revalidatePath("/account");
}

