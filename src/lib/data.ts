import { unstable_noStore as noStore } from "next/cache";
import {
  demoBoxItems,
  demoBoxes,
  demoDeliveryRuns,
  demoFarmCards,
  demoFarms,
  demoOrders,
  demoSubscriptions,
  getBoxWithFarm,
  getFarmBySlug,
} from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Box, BoxWithFarm, FarmWithBox, Order, Profile, Subscription } from "@/lib/types";

export async function listFarmCards(category?: string): Promise<FarmWithBox[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return category ? demoFarmCards.filter((farm) => farm.category === category) : demoFarmCards;
  }

  const { data: farms } = await supabase
    .from("farms")
    .select("*")
    .eq("active", true)
    .order("name");

  if (!farms?.length) return demoFarmCards;

  const farmIds = farms.map((farm) => farm.id);
  const { data: boxes } = await supabase.from("boxes").select("*").in("farm_id", farmIds).eq("active", true);
  const { data: items } = await supabase.from("box_items").select("*").order("sort_order");

  return farms
    .filter((farm) => !category || farm.category === category)
    .map((farm) => {
      const featuredBox = (boxes as Box[] | null)?.find((box) => box.farm_id === farm.id) ?? demoBoxes[0];
      return {
        ...farm,
        category: farm.category ?? "mixed",
        featuredBox,
        items: (items ?? []).filter((item) => item.box_id === featuredBox.id),
      } as FarmWithBox;
    });
}

export async function getFeaturedBox(): Promise<BoxWithFarm> {
  noStore();
  const cards = await listFarmCards();
  const featured = cards[1] ?? cards[0];
  return {
    ...featured.featuredBox,
    farm: featured,
    items: featured.items,
  };
}

export async function getFarmDetail(slug: string): Promise<FarmWithBox | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return getFarmBySlug(slug);

  const { data: farm } = await supabase.from("farms").select("*").eq("slug", slug).eq("active", true).single();
  if (!farm) return getFarmBySlug(slug);

  const { data: box } = await supabase.from("boxes").select("*").eq("farm_id", farm.id).eq("active", true).single();
  const { data: items } = await supabase.from("box_items").select("*").eq("box_id", box?.id).order("sort_order");

  return {
    ...farm,
    category: farm.category ?? "mixed",
    featuredBox: (box as Box | null) ?? demoBoxes[0],
    items: (items ?? []) as FarmWithBox["items"],
  } as FarmWithBox;
}

export async function getBoxDetail(idOrSlug: string): Promise<BoxWithFarm | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return getBoxWithFarm(idOrSlug);

  const { data: box } = await supabase
    .from("boxes")
    .select("*, farms(*)")
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .eq("active", true)
    .single();

  if (!box) return getBoxWithFarm(idOrSlug);
  const { data: items } = await supabase.from("box_items").select("*").eq("box_id", box.id).order("sort_order");

  const farm = Array.isArray(box.farms) ? box.farms[0] : box.farms;
  return {
    ...(box as Box),
    farm,
    items: items ?? [],
  } as BoxWithFarm;
}

export async function getCustomerData(profile: Profile) {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
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

  return {
    subscriptions: (subscriptions ?? []) as Subscription[],
    orders: (orders ?? []) as Order[],
    boxes: demoBoxes,
    farms: demoFarms,
  };
}

export async function getFarmerData(profile: Profile) {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
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
    return {
      farms: demoFarms,
      boxes: demoBoxes,
      subscriptions: demoSubscriptions,
      orders: demoOrders,
      deliveryRuns: demoDeliveryRuns,
    };
  }

  const [farms, boxes, subscriptions, orders, deliveryRuns] = await Promise.all([
    supabase.from("farms").select("*").order("name"),
    supabase.from("boxes").select("*").order("title"),
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("delivery_date"),
    supabase.from("delivery_runs").select("*").order("delivery_date"),
  ]);

  return {
    farms: farms.data ?? [],
    boxes: boxes.data ?? [],
    subscriptions: subscriptions.data ?? [],
    orders: orders.data ?? [],
    deliveryRuns: deliveryRuns.data ?? [],
  };
}

