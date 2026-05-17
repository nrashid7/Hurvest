import { env } from "./env";
import { addWeeks, formatISO, parseISO } from "date-fns";
import type { Box, Farm, Frequency, Order, Profile, Subscription } from "@/lib/types";

const capacityStatuses = new Set(["active", "trialing"]);
export const supportedDeliveryZips = [
  "55401",
  "55402",
  "55403",
  "55404",
  "55405",
  "55406",
  "55407",
  "55408",
  "55409",
  "55410",
  "55411",
  "55412",
  "55413",
  "55414",
  "55415",
  "55416",
  "55417",
  "55418",
  "55419",
  "55454",
  "55101",
  "55102",
  "55103",
  "55104",
  "55105",
  "55106",
  "55107",
  "55108",
] as const;

const supportedDeliveryZipSet = new Set<string>(supportedDeliveryZips);

export function normalizeZip(zip: string | null | undefined) {
  return String(zip ?? "").trim().slice(0, 5);
}

export function isSupportedDeliveryZip(zip: string | null | undefined) {
  return supportedDeliveryZipSet.has(normalizeZip(zip));
}

export function getDeliveryServiceAreaLabel() {
  return "Launch delivery area: Minneapolis and Saint Paul core ZIPs.";
}

export function getSupportEmail() {
  return env.supportEmail;
}

export function hasCompleteDeliveryProfile(profile: Profile) {
  return Boolean(
    profile.full_name?.trim() &&
      profile.phone?.trim() &&
      profile.address_line1?.trim() &&
      profile.city?.trim() &&
      profile.state?.trim() &&
      profile.zip?.trim(),
  );
}

export function buildDeliveryAddress(profile: Profile) {
  const street = [profile.address_line1, profile.address_line2].map((part) => part?.trim()).filter(Boolean).join(", ");
  const stateZip = [profile.state, profile.zip].map((part) => part?.trim()).filter(Boolean).join(" ");
  const cityStateZip = [profile.city?.trim(), stateZip].filter(Boolean).join(", ");
  return [street, cityStateZip].filter(Boolean).join(", ");
}

export function getBoxCapacityStatus(box: Box, subscriptions: Subscription[]) {
  const activeCount = subscriptions.filter(
    (subscription) => subscription.box_id === box.id && capacityStatuses.has(subscription.status),
  ).length;

  if (!box.max_subscribers) {
    return { activeCount, remaining: null, state: "available" as const, label: "Available" };
  }

  const remaining = Math.max(box.max_subscribers - activeCount, 0);
  if (remaining === 0) {
    return { activeCount, remaining, state: "sold-out" as const, label: "Sold out" };
  }

  if (remaining <= Math.max(2, Math.ceil(box.max_subscribers * 0.2))) {
    return {
      activeCount,
      remaining,
      state: "almost-full" as const,
      label: `${remaining} ${remaining === 1 ? "spot" : "spots"} left`,
    };
  }

  return { activeCount, remaining, state: "available" as const, label: `${remaining} spots available` };
}

export function buildInitialOrderPayload({
  subscriptionId,
  profile,
  box,
  deliveryDate,
}: {
  subscriptionId: string;
  profile: Profile;
  box: Box;
  deliveryDate: string;
}) {
  return {
    subscription_id: subscriptionId,
    user_id: profile.id,
    farm_id: box.farm_id,
    box_id: box.id,
    delivery_date: deliveryDate,
    status: "confirmed" as const,
    total_cents: box.price_cents,
    delivery_address: buildDeliveryAddress(profile),
    delivery_notes: profile.delivery_notes,
  };
}

export function getStripeRecurringForFrequency(frequency: Frequency) {
  if (frequency === "monthly") {
    return { interval: "month" as const, interval_count: 1 };
  }

  return {
    interval: "week" as const,
    interval_count: frequency === "biweekly" ? 2 : 1,
  };
}

export function getFrequencyFromStripeRecurring({
  interval,
  intervalCount,
}: {
  interval: string | null | undefined;
  intervalCount: number | null | undefined;
}): Frequency {
  if (interval === "month") return "monthly";
  if (interval === "week" && intervalCount === 2) return "biweekly";
  return "weekly";
}

export function getNextSubscriptionDeliveryDate(deliveryDate: string, frequency: Frequency) {
  const weeks = frequency === "biweekly" ? 2 : frequency === "monthly" ? 4 : 1;
  return formatISO(addWeeks(parseISO(deliveryDate), weeks), { representation: "date" });
}

export function buildWeeklyOrderPayloads({
  subscriptions,
  profiles,
  boxes,
  deliveryDate,
  existingOrders,
}: {
  subscriptions: Subscription[];
  profiles: Profile[];
  boxes: Box[];
  deliveryDate: string;
  existingOrders: Pick<Order, "subscription_id" | "delivery_date">[];
}) {
  const existingKeys = new Set(existingOrders.map((order) => `${order.subscription_id}:${order.delivery_date}`));

  return subscriptions
    .filter((subscription) => capacityStatuses.has(subscription.status))
    .filter((subscription) => subscription.next_delivery_date <= deliveryDate)
    .filter((subscription) => !existingKeys.has(`${subscription.id}:${deliveryDate}`))
    .map((subscription) => {
      const profile = profiles.find((item) => item.id === subscription.user_id);
      const box = boxes.find((item) => item.id === subscription.box_id);
      if (!profile || !box) return null;
      return buildInitialOrderPayload({ subscriptionId: subscription.id, profile, box, deliveryDate });
    })
    .filter((payload): payload is ReturnType<typeof buildInitialOrderPayload> => Boolean(payload));
}

export function buildOrdersCsvRows({
  orders,
  profiles,
  farms,
  boxes,
}: {
  orders: Order[];
  profiles: Profile[];
  farms: Farm[];
  boxes: Box[];
}) {
  return [
    [
      "order_id",
      "delivery_date",
      "customer_name",
      "customer_email",
      "customer_phone",
      "farm",
      "box",
      "status",
      "total_cents",
      "delivery_address",
      "delivery_notes",
    ],
    ...orders.map((order) => {
      const profile = profiles.find((item) => item.id === order.user_id);
      return [
        order.id,
        order.delivery_date,
        profile?.full_name ?? "",
        profile?.email ?? "",
        profile?.phone ?? "",
        farms.find((farm) => farm.id === order.farm_id)?.name ?? "",
        boxes.find((box) => box.id === order.box_id)?.title ?? "",
        order.status,
        order.total_cents,
        order.delivery_address,
        order.delivery_notes ?? "",
      ];
    }),
  ];
}

export function sortOrdersForOperations<T extends Pick<Order, "delivery_date" | "status">>(orders: T[]) {
  return [...orders].sort((a, b) => {
    const aComplete = a.status === "delivered" || a.status === "cancelled";
    const bComplete = b.status === "delivered" || b.status === "cancelled";
    if (aComplete !== bComplete) return aComplete ? 1 : -1;
    return a.delivery_date.localeCompare(b.delivery_date);
  });
}
