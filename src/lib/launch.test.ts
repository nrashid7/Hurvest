import { describe, expect, it } from "vitest";
import type { Box, Profile, Subscription } from "@/lib/types";
import {
  buildDeliveryAddress,
  buildInitialOrderPayload,
  buildOrdersCsvRows,
  buildWeeklyOrderPayloads,
  getFrequencyFromStripeRecurring,
  getNextSubscriptionDeliveryDate,
  getStripeRecurringForFrequency,
  sortOrdersForOperations,
  getDeliveryServiceAreaLabel,
  getBoxCapacityStatus,
  hasCompleteDeliveryProfile,
  isSupportedDeliveryZip,
  getSupportEmail,
} from "./launch";

const profile: Profile = {
  id: "profile-1",
  full_name: "Maya Johnson",
  email: "maya@example.com",
  phone: "612-555-0101",
  role: "customer",
  address_line1: "2248 Bryant Ave S",
  address_line2: "Apt 2",
  city: "Minneapolis",
  state: "MN",
  zip: "55405",
  delivery_notes: "Leave on covered porch.",
  created_at: "2026-05-16T00:00:00.000Z",
  updated_at: "2026-05-16T00:00:00.000Z",
};

const box: Box = {
  id: "box-1",
  farm_id: "farm-1",
  title: "Friday Produce Box",
  slug: "friday-produce-box",
  description: "Seasonal vegetables.",
  farmer_message: "Fresh greens this week.",
  price_cents: 3900,
  currency: "usd",
  frequency: "weekly",
  delivery_day: "Friday",
  cutoff_day: "Wednesday",
  image_url: "https://example.com/box.jpg",
  active: true,
  max_subscribers: 3,
  created_at: "2026-05-16T00:00:00.000Z",
  updated_at: "2026-05-16T00:00:00.000Z",
};

describe("launch readiness helpers", () => {
  it("requires delivery profile fields before checkout", () => {
    expect(hasCompleteDeliveryProfile(profile)).toBe(true);
    expect(hasCompleteDeliveryProfile({ ...profile, phone: "" })).toBe(false);
    expect(hasCompleteDeliveryProfile({ ...profile, zip: null })).toBe(false);
  });

  it("limits launch delivery to supported Minneapolis and Saint Paul ZIPs", () => {
    expect(isSupportedDeliveryZip("55405")).toBe(true);
    expect(isSupportedDeliveryZip(" 55101-1234 ")).toBe(true);
    expect(isSupportedDeliveryZip("55057")).toBe(false);
    expect(getDeliveryServiceAreaLabel()).toContain("Minneapolis");
    expect(getDeliveryServiceAreaLabel()).toContain("Saint Paul");
  });

  it("has a launch support contact", () => {
    expect(getSupportEmail()).toBe("support@hurvest.local");
  });

  it("formats a delivery address snapshot for orders", () => {
    expect(buildDeliveryAddress(profile)).toBe("2248 Bryant Ave S, Apt 2, Minneapolis, MN 55405");
    expect(buildDeliveryAddress({ ...profile, address_line2: "" })).toBe("2248 Bryant Ave S, Minneapolis, MN 55405");
  });

  it("builds the first order payload from a paid subscription", () => {
    expect(
      buildInitialOrderPayload({
        subscriptionId: "sub-row-1",
        profile,
        box,
        deliveryDate: "2026-05-22",
      }),
    ).toEqual({
      subscription_id: "sub-row-1",
      user_id: "profile-1",
      farm_id: "farm-1",
      box_id: "box-1",
      delivery_date: "2026-05-22",
      status: "confirmed",
      total_cents: 3900,
      delivery_address: "2248 Bryant Ave S, Apt 2, Minneapolis, MN 55405",
      delivery_notes: "Leave on covered porch.",
    });
  });

  it("advances subscription delivery dates by frequency", () => {
    expect(getNextSubscriptionDeliveryDate("2026-05-22", "weekly")).toBe("2026-05-29");
    expect(getNextSubscriptionDeliveryDate("2026-05-22", "biweekly")).toBe("2026-06-05");
    expect(getNextSubscriptionDeliveryDate("2026-05-22", "monthly")).toBe("2026-06-19");
  });

  it("maps Hurvest frequencies to and from Stripe recurring settings", () => {
    expect(getStripeRecurringForFrequency("weekly")).toEqual({ interval: "week", interval_count: 1 });
    expect(getStripeRecurringForFrequency("biweekly")).toEqual({ interval: "week", interval_count: 2 });
    expect(getStripeRecurringForFrequency("monthly")).toEqual({ interval: "month", interval_count: 1 });

    expect(getFrequencyFromStripeRecurring({ interval: "week", intervalCount: 1 })).toBe("weekly");
    expect(getFrequencyFromStripeRecurring({ interval: "week", intervalCount: 2 })).toBe("biweekly");
    expect(getFrequencyFromStripeRecurring({ interval: "month", intervalCount: 1 })).toBe("monthly");
    expect(getFrequencyFromStripeRecurring({ interval: "day", intervalCount: 7 })).toBe("weekly");
  });

  it("builds missing weekly order payloads only for active due subscriptions", () => {
    const subscriptions: Subscription[] = [
      {
        id: "sub-due",
        user_id: "profile-1",
        box_id: "box-1",
        farm_id: "farm-1",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: "active",
        frequency: "weekly",
        price_cents: 3900,
        next_delivery_date: "2026-05-22",
        created_at: "",
        updated_at: "",
      },
      {
        id: "sub-paused",
        user_id: "profile-1",
        box_id: "box-1",
        farm_id: "farm-1",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: "paused",
        frequency: "weekly",
        price_cents: 3900,
        next_delivery_date: "2026-05-22",
        created_at: "",
        updated_at: "",
      },
      {
        id: "sub-future",
        user_id: "profile-1",
        box_id: "box-1",
        farm_id: "farm-1",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: "active",
        frequency: "weekly",
        price_cents: 3900,
        next_delivery_date: "2026-05-29",
        created_at: "",
        updated_at: "",
      },
    ];

    expect(
      buildWeeklyOrderPayloads({
        subscriptions,
        profiles: [profile],
        boxes: [box],
        deliveryDate: "2026-05-22",
        existingOrders: [],
      }),
    ).toEqual([
      {
        subscription_id: "sub-due",
        user_id: "profile-1",
        farm_id: "farm-1",
        box_id: "box-1",
        delivery_date: "2026-05-22",
        status: "confirmed",
        total_cents: 3900,
        delivery_address: "2248 Bryant Ave S, Apt 2, Minneapolis, MN 55405",
        delivery_notes: "Leave on covered porch.",
      },
    ]);

    expect(
      buildWeeklyOrderPayloads({
        subscriptions,
        profiles: [profile],
        boxes: [box],
        deliveryDate: "2026-05-22",
        existingOrders: [{ subscription_id: "sub-due", delivery_date: "2026-05-22" }],
      }),
    ).toEqual([]);
  });

  it("summarizes box capacity from active subscriptions", () => {
    const subscriptions: Subscription[] = [
      { id: "sub-1", user_id: "profile-1", box_id: "box-1", farm_id: "farm-1", stripe_customer_id: null, stripe_subscription_id: null, status: "active", frequency: "weekly", price_cents: 3900, next_delivery_date: "2026-05-22", created_at: "", updated_at: "" },
      { id: "sub-2", user_id: "profile-2", box_id: "box-1", farm_id: "farm-1", stripe_customer_id: null, stripe_subscription_id: null, status: "paused", frequency: "weekly", price_cents: 3900, next_delivery_date: "2026-05-22", created_at: "", updated_at: "" },
      { id: "sub-3", user_id: "profile-3", box_id: "box-1", farm_id: "farm-1", stripe_customer_id: null, stripe_subscription_id: null, status: "trialing", frequency: "weekly", price_cents: 3900, next_delivery_date: "2026-05-22", created_at: "", updated_at: "" },
    ];

    expect(getBoxCapacityStatus(box, subscriptions)).toEqual({
      activeCount: 2,
      remaining: 1,
      state: "almost-full",
      label: "1 spot left",
    });
    expect(getBoxCapacityStatus({ ...box, max_subscribers: 2 }, subscriptions).state).toBe("sold-out");
    expect(getBoxCapacityStatus({ ...box, max_subscribers: null }, subscriptions).state).toBe("available");
  });

  it("builds admin delivery export rows with customer contact details", () => {
    const rows = buildOrdersCsvRows({
      orders: [
        {
          id: "order-1",
          subscription_id: "sub-1",
          user_id: "profile-1",
          farm_id: "farm-1",
          box_id: "box-1",
          delivery_date: "2026-05-22",
          status: "confirmed",
          total_cents: 3900,
          delivery_address: "2248 Bryant Ave S, Apt 2, Minneapolis, MN 55405",
          delivery_notes: "Leave on covered porch.",
          created_at: "",
          updated_at: "",
        },
      ],
      profiles: [profile],
      farms: [{ id: "farm-1", owner_id: null, name: "Northstar", slug: "northstar", short_description: "", story: "", location: "", city: "", state: "MN", image_url: "", banner_url: "", active: true, category: "produce", created_at: "", updated_at: "" }],
      boxes: [box],
    });

    expect(rows[0]).toEqual([
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
    ]);
    expect(rows[1]).toEqual([
      "order-1",
      "2026-05-22",
      "Maya Johnson",
      "maya@example.com",
      "612-555-0101",
      "Northstar",
      "Friday Produce Box",
      "confirmed",
      3900,
      "2248 Bryant Ave S, Apt 2, Minneapolis, MN 55405",
      "Leave on covered porch.",
    ]);
  });

  it("sorts active upcoming orders before completed orders", () => {
    const orders = [
      { id: "delivered", subscription_id: "sub", user_id: "profile", farm_id: "farm", box_id: "box", delivery_date: "2026-05-15", status: "delivered", total_cents: 3900, delivery_address: "", delivery_notes: null, created_at: "", updated_at: "" },
      { id: "future", subscription_id: "sub", user_id: "profile", farm_id: "farm", box_id: "box", delivery_date: "2026-05-29", status: "confirmed", total_cents: 3900, delivery_address: "", delivery_notes: null, created_at: "", updated_at: "" },
      { id: "next", subscription_id: "sub", user_id: "profile", farm_id: "farm", box_id: "box", delivery_date: "2026-05-22", status: "pending", total_cents: 3900, delivery_address: "", delivery_notes: null, created_at: "", updated_at: "" },
    ] as const;

    expect(sortOrdersForOperations([...orders]).map((order) => order.id)).toEqual(["next", "future", "delivered"]);
  });
});
