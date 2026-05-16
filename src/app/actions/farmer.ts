"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateFarmAction(formData: FormData) {
  const profile = await requireRole(["farmer", "admin"]);
  const farmId = String(formData.get("farm_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/farmer?demo=1");

  await supabase
    .from("farms")
    .update({
      name: String(formData.get("name") ?? ""),
      short_description: String(formData.get("short_description") ?? ""),
      story: String(formData.get("story") ?? ""),
      location: String(formData.get("location") ?? ""),
      active: formData.get("active") === "on",
    })
    .eq("id", farmId)
    .or(`owner_id.eq.${profile.id},owner_id.is.null`);

  revalidatePath("/farmer");
}

export async function updateBoxAction(formData: FormData) {
  await requireRole(["farmer", "admin"]);
  const boxId = String(formData.get("box_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/farmer?demo=1");

  await supabase
    .from("boxes")
    .update({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      farmer_message: String(formData.get("farmer_message") ?? ""),
      price_cents: Number(formData.get("price_cents") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", boxId);

  const rawItems = String(formData.get("items") ?? "");
  const items = rawItems
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (items.length) {
    await supabase.from("box_items").delete().eq("box_id", boxId);
    await supabase.from("box_items").insert(
      items.map((name, index) => ({
        box_id: boxId,
        name,
        sort_order: index + 1,
      })),
    );
  }

  revalidatePath("/farmer");
}

