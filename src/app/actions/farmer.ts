"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { parseBooleanSwitch, parseBoxItems } from "@/lib/forms";
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
      active: parseBooleanSwitch(formData.get("active")),
    })
    .eq("id", farmId)
    .eq("owner_id", profile.id);

  revalidatePath("/farmer");
}

export async function updateBoxAction(formData: FormData) {
  const profile = await requireRole(["farmer", "admin"]);
  const boxId = String(formData.get("box_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/farmer?demo=1");

  const { data: box } = await supabase.from("boxes").select("id, farm_id").eq("id", boxId).single();
  if (!box) redirect("/farmer?error=box-not-found");

  if (profile.role !== "admin") {
    const { data: farm } = await supabase.from("farms").select("id").eq("id", box.farm_id).eq("owner_id", profile.id).single();
    if (!farm) redirect("/farmer?error=not-authorized");
  }

  await supabase
    .from("boxes")
    .update({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      farmer_message: String(formData.get("farmer_message") ?? ""),
      price_cents: Number(formData.get("price_cents") ?? 0),
      active: parseBooleanSwitch(formData.get("active")),
    })
    .eq("id", boxId);

  const items = parseBoxItems(formData.get("items"));

  await supabase.from("box_items").delete().eq("box_id", boxId);
  if (items.length) {
    await supabase.from("box_items").insert(
      items.map((item) => ({
        box_id: boxId,
        name: item.name,
        quantity: item.quantity,
        sort_order: item.sort_order,
      })),
    );
  }

  revalidatePath("/farmer");
}
