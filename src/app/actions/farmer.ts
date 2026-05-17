"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { asFarmCategory, asFrequency, parseBooleanSwitch, parseBoxItems, parseOptionalInteger, slugify } from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createFarmAction(formData: FormData) {
  const profile = await requireRole(["farmer", "admin"]);
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/farmer/onboarding?demo=1");

  const category = asFarmCategory(formData.get("category"));
  if (!category) redirect("/farmer/onboarding?error=invalid-farm-category");

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const payload = {
    owner_id: profile.id,
    name,
    slug,
    short_description: String(formData.get("short_description") ?? "").trim(),
    story: String(formData.get("story") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "Minnesota").trim() || "Minnesota",
    category,
    image_url: String(formData.get("image_url") ?? "").trim(),
    banner_url: String(formData.get("banner_url") ?? "").trim(),
    active: true,
  };

  if (!payload.name || !payload.slug || !payload.short_description || !payload.story || !payload.location || !payload.city || !payload.image_url || !payload.banner_url) {
    redirect("/farmer/onboarding?error=farm-fields-required");
  }

  const { error } = await supabase.from("farms").insert(payload);
  if (error) redirect(`/farmer/onboarding?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/farmer");
  revalidatePath("/farms");
  redirect("/farmer");
}

export async function updateFarmAction(formData: FormData) {
  const profile = await requireRole(["farmer", "admin"]);
  const farmId = String(formData.get("farm_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/farmer?demo=1");

  const category = asFarmCategory(formData.get("category"));
  if (!category) redirect("/farmer?error=invalid-farm-category");

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || name));

  await supabase
    .from("farms")
    .update({
      name,
      slug,
      short_description: String(formData.get("short_description") ?? "").trim(),
      story: String(formData.get("story") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "Minnesota").trim() || "Minnesota",
      category,
      image_url: String(formData.get("image_url") ?? "").trim(),
      banner_url: String(formData.get("banner_url") ?? "").trim(),
      active: parseBooleanSwitch(formData.get("active")),
    })
    .eq("id", farmId)
    .eq("owner_id", profile.id);

  revalidatePath("/farmer");
  revalidatePath("/farms");
}

async function assertOwnsBox(boxId: string, profileId: string, role: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: box } = await supabase.from("boxes").select("id, farm_id").eq("id", boxId).single();
  if (!box) redirect("/farmer?error=box-not-found");

  if (role !== "admin") {
    const { data: farm } = await supabase.from("farms").select("id").eq("id", box.farm_id).eq("owner_id", profileId).single();
    if (!farm) redirect("/farmer?error=not-authorized");
  }

  return { supabase, box };
}

export async function createBoxAction(formData: FormData) {
  const profile = await requireRole(["farmer", "admin"]);
  const farmId = String(formData.get("farm_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/farmer?demo=1");

  if (profile.role !== "admin") {
    const { data: farm } = await supabase.from("farms").select("id").eq("id", farmId).eq("owner_id", profile.id).single();
    if (!farm) redirect("/farmer?error=not-authorized");
  }

  const frequency = asFrequency(formData.get("frequency"));
  if (!frequency) redirect("/farmer?error=invalid-frequency");

  const title = String(formData.get("title") ?? "").trim();
  const payload = {
    farm_id: farmId,
    title,
    slug: slugify(String(formData.get("slug") || title)),
    description: String(formData.get("description") ?? "").trim(),
    farmer_message: String(formData.get("farmer_message") ?? "").trim(),
    price_cents: Number(formData.get("price_cents") ?? 0),
    frequency,
    image_url: String(formData.get("image_url") ?? "").trim(),
    max_subscribers: parseOptionalInteger(formData.get("max_subscribers")),
    active: true,
  };

  if (!payload.farm_id || !payload.title || !payload.slug || !payload.description || !payload.farmer_message || !payload.price_cents || !payload.image_url) {
    redirect("/farmer?error=box-fields-required");
  }

  const { data, error } = await supabase.from("boxes").insert(payload).select("id").single();
  if (error) redirect(`/farmer?error=${encodeURIComponent(error.message)}`);

  const items = parseBoxItems(formData.get("items"));
  if (data?.id && items.length) {
    await supabase.from("box_items").insert(items.map((item) => ({ ...item, box_id: data.id })));
  }

  revalidatePath("/farmer");
  revalidatePath("/farms");
}

export async function updateBoxAction(formData: FormData) {
  const profile = await requireRole(["farmer", "admin"]);
  const boxId = String(formData.get("box_id") ?? "");
  const result = await assertOwnsBox(boxId, profile.id, profile.role);
  if (!result) redirect("/farmer?demo=1");
  const { supabase } = result;

  const frequency = asFrequency(formData.get("frequency"));
  if (!frequency) redirect("/farmer?error=invalid-frequency");
  const title = String(formData.get("title") ?? "").trim();

  await supabase
    .from("boxes")
    .update({
      title,
      slug: slugify(String(formData.get("slug") || title)),
      description: String(formData.get("description") ?? "").trim(),
      farmer_message: String(formData.get("farmer_message") ?? "").trim(),
      price_cents: Number(formData.get("price_cents") ?? 0),
      frequency,
      image_url: String(formData.get("image_url") ?? "").trim(),
      max_subscribers: parseOptionalInteger(formData.get("max_subscribers")),
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
  revalidatePath("/farms");
}
