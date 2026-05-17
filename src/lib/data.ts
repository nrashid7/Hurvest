import { unstable_noStore as noStore } from "next/cache";
import {
  demoBoxItems,
  demoBoxes,
  demoDeliveryRuns,
  demoFarmCards,
  demoFarms,
  demoOrders,
  demoProfiles,
  demoSubscriptions,
  getBoxWithFarm,
  getFarmBySlug,
} from "@/lib/demo-data";
import { isDemoModeAllowed } from "@/lib/env";
import { isSlug, isUuid } from "@/lib/forms";
import { getBoxCapacityStatus } from "@/lib/launch";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Box, BoxItem, BoxWithFarm, Farm, FarmWithBox, Order, Profile, Subscription } from "@/lib/types";

export async function listFarmCards(category?: string): Promise<FarmWithBox[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (!isDemoModeAllowed()) return [];
    return category ? demoFarmCards.filter((farm) => farm.category === category) : demoFarmCards;
  }

  const { data: farms } = await supabase
    .from("farms")
    .select("*")
    .eq("active", true)
    .order("name");

  if (!farms?.length) return [];

  const farmIds = farms.map((farm) => farm.id);
  const { data: boxes } = await supabase.from("boxes").select("*").in("farm_id", farmIds).eq("active", true);
  const { data: items } = await supabase.from("box_items").select("*").order("sort_order");
  const boxIds = ((boxes as Box[] | null) ?? []).map((box) => box.id);
  const { data: subscriptions } = boxIds.length
    ? await supabase.from("subscriptions").select("*").in("box_id", boxIds)
    : { data: [] };

  return farms
    .filter((farm) => !category || farm.category === category)
    .map((farm) => {
      const featuredBox = (boxes as Box[] | null)?.find((box) => box.farm_id === farm.id);
      if (!featuredBox) return null;
      return {
        ...farm,
        category: farm.category ?? "mixed",
        featuredBox: {
          ...featuredBox,
          capacity: getBoxCapacityStatus(featuredBox, (subscriptions ?? []) as Subscription[]),
        },
        items: (items ?? []).filter((item) => item.box_id === featuredBox.id),
      } as FarmWithBox;
    })
    .filter((farm): farm is FarmWithBox => Boolean(farm));
}

export async function getFeaturedBox(): Promise<BoxWithFarm> {
  noStore();
  const cards = await listFarmCards();
  const featured = cards[1] ?? cards[0];
  if (!featured) {
    if (!isDemoModeAllowed()) throw new Error("No featured farm box is available.");
    const fallback = getBoxWithFarm(demoBoxes[0].id);
    if (!fallback) throw new Error("No featured farm box is available.");
    return fallback;
  }
  return {
    ...featured.featuredBox,
    farm: featured,
    items: featured.items,
  };
}

export async function getFarmDetail(slug: string): Promise<FarmWithBox | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isDemoModeAllowed() ? getFarmBySlug(slug) : null;

  const { data: farm } = await supabase.from("farms").select("*").eq("slug", slug).eq("active", true).single();
  if (!farm) return null;

  const { data: box } = await supabase.from("boxes").select("*").eq("farm_id", farm.id).eq("active", true).single();
  if (!box) return null;
  const { data: items } = await supabase.from("box_items").select("*").eq("box_id", box?.id).order("sort_order");
  const { data: subscriptions } = await supabase.from("subscriptions").select("*").eq("box_id", box.id);

  return {
    ...farm,
    category: farm.category ?? "mixed",
    featuredBox: { ...(box as Box), capacity: getBoxCapacityStatus(box as Box, (subscriptions ?? []) as Subscription[]) },
    items: (items ?? []) as FarmWithBox["items"],
  } as FarmWithBox;
}

export async function getBoxDetail(idOrSlug: string): Promise<BoxWithFarm | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isDemoModeAllowed() ? getBoxWithFarm(idOrSlug) : null;
  if (!isUuid(idOrSlug) && !isSlug(idOrSlug)) return null;

  const query = supabase.from("boxes").select("*, farms(*)").eq("active", true);
  const { data: box } = isUuid(idOrSlug)
    ? await query.eq("id", idOrSlug).single()
    : await query.eq("slug", idOrSlug).single();

  if (!box) return null;
  const { data: items } = await supabase.from("box_items").select("*").eq("box_id", box.id).order("sort_order");
  const { data: subscriptions } = await supabase.from("subscriptions").select("*").eq("box_id", box.id);

  const farm = Array.isArray(box.farms) ? box.farms[0] : box.farms;
  return {
    ...(box as Box),
    farm,
    items: items ?? [],
    capacity: getBoxCapacityStatus(box as Box, (subscriptions ?? []) as Subscription[]),
  } as BoxWithFarm;
}

export async function listBoxSubscriptions(boxId: string): Promise<Subscription[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isDemoModeAllowed() ? demoSubscriptions.filter((subscription) => subscription.box_id === boxId) : [];

  const { data } = await supabase.from("subscriptions").select("*").eq("box_id", boxId);
  return (data ?? []) as Subscription[];
}

export async function getCustomerData(profile: Profile) {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (!isDemoModeAllowed()) return { subscriptions: [], orders: [], boxes: [], farms: [] };
    return {
      subscriptions: demoSubscriptions,
      orders: demoOrders,
      boxes: demoBoxes,
      farms: demoFarms,
    };
  }

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", profile.id)
    .order("delivery_date", { ascending: false });

  const boxIds = new Set<string>();
  const farmIds = new Set<string>();
  for (const subscription of subscriptions ?? []) {
    boxIds.add(subscription.box_id);
    farmIds.add(subscription.farm_id);
  }
  for (const order of orders ?? []) {
    boxIds.add(order.box_id);
    farmIds.add(order.farm_id);
  }

  const [boxes, farms] = await Promise.all([
    boxIds.size ? supabase.from("boxes").select("*").in("id", Array.from(boxIds)) : Promise.resolve({ data: [] }),
    farmIds.size ? supabase.from("farms").select("*").in("id", Array.from(farmIds)) : Promise.resolve({ data: [] }),
  ]);

  return {
    subscriptions: (subscriptions ?? []) as Subscription[],
    orders: (orders ?? []) as Order[],
    boxes: (boxes.data ?? []) as Box[],
    farms: (farms.data ?? []) as Farm[],
  };
}

export async function getFarmerData(profile: Profile) {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (!isDemoModeAllowed()) return { farms: [], boxes: [], items: [], subscriptions: [], orders: [] };
    return {
      farms: demoFarms,
      boxes: demoBoxes,
      items: demoBoxItems,
      subscriptions: demoSubscriptions,
      orders: demoOrders,
    };
  }

  const { data: farms } = await supabase.from("farms").select("*").eq("owner_id", profile.id).order("name");
  const farmIds = farms?.map((farm) => farm.id) ?? [];
  if (!farmIds.length) {
    return { farms: [], boxes: [], items: [], subscriptions: [], orders: [] };
  }

  const { data: boxes } = await supabase.from("boxes").select("*").in("farm_id", farmIds);
  const { data: orders } = await supabase.from("orders").select("*").in("farm_id", farmIds).order("delivery_date");
  const { data: subscriptions } = await supabase.from("subscriptions").select("*").in("farm_id", farmIds);
  const { data: items } = await supabase.from("box_items").select("*").order("sort_order");

  return { farms: farms ?? [], boxes: boxes ?? [], items: items ?? [], subscriptions: subscriptions ?? [], orders: orders ?? [] };
}

export async function getAdminData() {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (!isDemoModeAllowed()) {
      return { profiles: [], farms: [], boxes: [], items: [], subscriptions: [], orders: [], deliveryRuns: [] };
    }
    return {
      profiles: demoProfiles,
      farms: demoFarms,
      boxes: demoBoxes,
      items: demoBoxItems,
      subscriptions: demoSubscriptions,
      orders: demoOrders,
      deliveryRuns: demoDeliveryRuns,
    };
  }

  const [profiles, farms, boxes, boxItems, subscriptions, orders, deliveryRuns] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("farms").select("*").order("name"),
    supabase.from("boxes").select("*").order("title"),
    supabase.from("box_items").select("*").order("sort_order"),
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("delivery_date"),
    supabase.from("delivery_runs").select("*").order("delivery_date"),
  ]);

  return {
    profiles: (profiles.data ?? []) as Profile[],
    farms: farms.data ?? [],
    boxes: boxes.data ?? [],
    items: (boxItems.data ?? []) as BoxItem[],
    subscriptions: subscriptions.data ?? [],
    orders: orders.data ?? [],
    deliveryRuns: deliveryRuns.data ?? [],
  };
}
