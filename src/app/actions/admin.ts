"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { asFarmCategory, asFrequency, asOrderStatus, asSubscriptionStatus, asUserRole, parseBooleanSwitch, parseBoxItems, parseOptionalInteger } from "@/lib/forms";
import { buildWeeklyOrderPayloads, getNextSubscriptionDeliveryDate } from "@/lib/launch";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Box, Order, Profile, Subscription } from "@/lib/types";

export async function updateOrderStatusAction(formData: FormData) {
  await requireRole(["admin"]);
  const orderId = String(formData.get("order_id") ?? "");
  const status = asOrderStatus(formData.get("status"));
  if (!status) redirect("/admin?error=invalid-order-status");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin?demo=1");

  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin");
}

export async function updateProfileRoleAction(formData: FormData) {
  await requireRole(["admin"]);
  const profileId = String(formData.get("profile_id") ?? "");
  const role = asUserRole(formData.get("role"));
  const supabase = await createSupabaseServerClient();

  if (!role) redirect("/admin?error=invalid-role");
  if (!supabase) redirect("/admin?demo=1");

  await supabase.from("profiles").update({ role }).eq("id", profileId);
  revalidatePath("/admin");
}

export async function assignFarmOwnerAction(formData: FormData) {
  await requireRole(["admin"]);
  const farmId = String(formData.get("farm_id") ?? "");
  const ownerId = String(formData.get("owner_id") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/admin?demo=1");

  await supabase
    .from("farms")
    .update({ owner_id: ownerId === "unassigned" ? null : ownerId })
    .eq("id", farmId);
  revalidatePath("/admin");
  revalidatePath("/farmer");
}

export async function updateAdminFarmAction(formData: FormData) {
  await requireRole(["admin"]);
  const farmId = String(formData.get("farm_id") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/admin?demo=1");

  const category = asFarmCategory(formData.get("category"));
  if (!category) redirect("/admin?error=invalid-farm-category");

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    short_description: String(formData.get("short_description") ?? "").trim(),
    story: String(formData.get("story") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "Minnesota").trim() || "Minnesota",
    category,
    image_url: String(formData.get("image_url") ?? "").trim(),
    banner_url: String(formData.get("banner_url") ?? "").trim(),
    active: parseBooleanSwitch(formData.get("active")),
  };

  if (!payload.name || !payload.slug || !payload.short_description || !payload.story || !payload.location || !payload.city || !payload.image_url || !payload.banner_url) {
    redirect("/admin?error=farm-fields-required");
  }

  await supabase.from("farms").update(payload).eq("id", farmId);
  revalidatePath("/admin");
  revalidatePath("/farms");
}

export async function createAdminFarmAction(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/admin?demo=1");

  const category = asFarmCategory(formData.get("category"));
  if (!category) redirect("/admin?error=invalid-farm-category");

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
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
    redirect("/admin?error=farm-fields-required");
  }

  await supabase.from("farms").insert(payload);
  revalidatePath("/admin");
  revalidatePath("/farms");
}

export async function updateAdminBoxAction(formData: FormData) {
  await requireRole(["admin"]);
  const boxId = String(formData.get("box_id") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/admin?demo=1");

  const frequency = asFrequency(formData.get("frequency"));
  if (!frequency) redirect("/admin?error=invalid-frequency");

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    farmer_message: String(formData.get("farmer_message") ?? "").trim(),
    price_cents: Number(formData.get("price_cents") ?? 0),
    frequency,
    max_subscribers: parseOptionalInteger(formData.get("max_subscribers")),
    image_url: String(formData.get("image_url") ?? "").trim(),
    active: parseBooleanSwitch(formData.get("active")),
  };

  if (!payload.title || !payload.slug || !payload.description || !payload.farmer_message || !payload.price_cents || !payload.image_url) {
    redirect("/admin?error=box-fields-required");
  }

  await supabase.from("boxes").update(payload).eq("id", boxId);

  const items = parseBoxItems(formData.get("items"));
  await supabase.from("box_items").delete().eq("box_id", boxId);
  if (items.length) {
    await supabase.from("box_items").insert(items.map((item) => ({ ...item, box_id: boxId })));
  }

  revalidatePath("/admin");
  revalidatePath("/farms");
}

export async function createAdminBoxAction(formData: FormData) {
  await requireRole(["admin"]);
  const farmId = String(formData.get("farm_id") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect("/admin?demo=1");

  const frequency = asFrequency(formData.get("frequency"));
  if (!frequency) redirect("/admin?error=invalid-frequency");

  const payload = {
    farm_id: farmId,
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    farmer_message: String(formData.get("farmer_message") ?? "").trim(),
    price_cents: Number(formData.get("price_cents") ?? 0),
    frequency,
    image_url: String(formData.get("image_url") ?? "").trim(),
    max_subscribers: parseOptionalInteger(formData.get("max_subscribers")),
    active: true,
  };

  if (!payload.farm_id || !payload.title || !payload.slug || !payload.description || !payload.farmer_message || !payload.price_cents || !payload.image_url) {
    redirect("/admin?error=box-fields-required");
  }

  const { data } = await supabase.from("boxes").insert(payload).select("id").single();
  const items = parseBoxItems(formData.get("items"));
  if (data?.id && items.length) {
    await supabase.from("box_items").insert(items.map((item) => ({ ...item, box_id: data.id })));
  }

  revalidatePath("/admin");
  revalidatePath("/farms");
}

export async function updateAdminSubscriptionStatusAction(formData: FormData) {
  await requireRole(["admin"]);
  const subscriptionId = String(formData.get("subscription_id") ?? "");
  const status = asSubscriptionStatus(formData.get("status"));
  const supabase = await createSupabaseServerClient();

  if (!status) redirect("/admin?error=invalid-subscription-status");
  if (!supabase) redirect("/admin?demo=1");

  await supabase.from("subscriptions").update({ status }).eq("id", subscriptionId);
  revalidatePath("/admin");
}

export async function updateDeliveryRunAction(formData: FormData) {
  await requireRole(["admin"]);
  const runId = String(formData.get("delivery_run_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin?demo=1");

  await supabase
    .from("delivery_runs")
    .update({
      status: String(formData.get("status") ?? "planning"),
      notes: String(formData.get("notes") ?? ""),
    })
    .eq("id", runId);

  revalidatePath("/admin");
}

export async function generateWeeklyOrdersAction(formData: FormData) {
  await requireRole(["admin"]);
  const deliveryDate = String(formData.get("delivery_date") ?? "").trim();
  const supabase = await createSupabaseServerClient();

  if (!deliveryDate) redirect("/admin?error=missing-delivery-date");
  if (!supabase) redirect("/admin?demo=1");

  const [{ data: subscriptions }, { data: profiles }, { data: boxes }, { data: existingOrders }] = await Promise.all([
    supabase.from("subscriptions").select("*").lte("next_delivery_date", deliveryDate),
    supabase.from("profiles").select("*"),
    supabase.from("boxes").select("*"),
    supabase.from("orders").select("subscription_id, delivery_date").eq("delivery_date", deliveryDate),
  ]);

  const orderPayloads = buildWeeklyOrderPayloads({
    subscriptions: (subscriptions ?? []) as Subscription[],
    profiles: (profiles ?? []) as Profile[],
    boxes: (boxes ?? []) as Box[],
    deliveryDate,
    existingOrders: (existingOrders ?? []) as Pick<Order, "subscription_id" | "delivery_date">[],
  });

  if (orderPayloads.length) {
    await supabase.from("orders").upsert(orderPayloads, {
      onConflict: "subscription_id,delivery_date",
      ignoreDuplicates: true,
    });
  }

  const dueSubscriptions = ((subscriptions ?? []) as Subscription[]).filter((subscription) =>
    orderPayloads.some((order) => order.subscription_id === subscription.id),
  );

  await Promise.all(
    dueSubscriptions.map((subscription) =>
      supabase
        .from("subscriptions")
        .update({ next_delivery_date: getNextSubscriptionDeliveryDate(deliveryDate, subscription.frequency) })
        .eq("id", subscription.id),
    ),
  );

  await supabase.from("delivery_runs").upsert(
    { delivery_date: deliveryDate, status: "planning" },
    { onConflict: "delivery_date", ignoreDuplicates: true },
  );

  revalidatePath("/admin");
}
