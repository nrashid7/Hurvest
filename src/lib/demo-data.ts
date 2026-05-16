import type { Box, BoxItem, DeliveryRun, Farm, FarmWithBox, Order, Profile, Subscription } from "@/lib/types";

const now = new Date("2026-05-16T12:00:00.000Z").toISOString();

export const demoFarms: Farm[] = [
  {
    id: "farm-northstar",
    owner_id: "profile-farmer",
    name: "Northstar Produce Co.",
    slug: "northstar-produce",
    short_description: "Crisp greens, roots, herbs, and seasonal produce grown outside Northfield.",
    story:
      "Northstar Produce grows vegetables in small, carefully rotated fields with a focus on soil health, flavor, and steady weekly harvests. Their Friday boxes are built around what tastes best that week, not what ships farthest.",
    location: "Northfield, MN",
    city: "Northfield",
    state: "Minnesota",
    image_url:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=80",
    active: true,
    category: "produce",
    created_at: now,
    updated_at: now,
  },
  {
    id: "farm-linden",
    owner_id: "profile-farmer",
    name: "Linden Hollow Organics",
    slug: "linden-hollow-organics",
    short_description: "Organic vegetable boxes with tender greens, pantry staples, and farmer notes.",
    story:
      "Linden Hollow is a family-run organic vegetable farm near Stillwater. Their boxes lean colorful and generous: salad greens, brassicas, herbs, storage vegetables, and one small surprise from the field.",
    location: "Stillwater, MN",
    city: "Stillwater",
    state: "Minnesota",
    image_url:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1800&q=80",
    active: true,
    category: "mixed",
    created_at: now,
    updated_at: now,
  },
  {
    id: "farm-red-barn",
    owner_id: "profile-farmer",
    name: "Red Barn Pastures",
    slug: "red-barn-pastures",
    short_description: "Pasture-raised proteins curated for simple Friday dinners and weekend meals.",
    story:
      "Red Barn Pastures works with rotational grazing and small-batch butchery partners. Their protein box is designed for households who want a dependable local meat subscription without needing to sort through cuts every week.",
    location: "Mankato, MN",
    city: "Mankato",
    state: "Minnesota",
    image_url:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1800&q=80",
    active: true,
    category: "meat",
    created_at: now,
    updated_at: now,
  },
  {
    id: "farm-meadow",
    owner_id: "profile-farmer",
    name: "Meadowbrook Dairy & Eggs",
    slug: "meadowbrook-dairy-eggs",
    short_description: "Weekly staples from pasture hens and small Minnesota dairy makers.",
    story:
      "Meadowbrook partners with nearby creameries and keeps a small flock of pasture hens. The box is intentionally simple: the weekly staples families reach for first, delivered fresh every Friday.",
    location: "St. Joseph, MN",
    city: "St. Joseph",
    state: "Minnesota",
    image_url:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1400&q=80",
    banner_url:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1800&q=80",
    active: true,
    category: "eggs",
    created_at: now,
    updated_at: now,
  },
];

export const demoBoxes: Box[] = [
  {
    id: "box-produce",
    farm_id: "farm-northstar",
    title: "Friday Produce Box",
    slug: "friday-produce-box",
    description: "A weekly mix of crisp greens, seasonal vegetables, herbs, and one simple fruit or storage crop.",
    farmer_message: "This week is bright and green: tender lettuces, breakfast radishes, asparagus, chives, and rhubarb.",
    price_cents: 3900,
    currency: "usd",
    frequency: "weekly",
    delivery_day: "Friday",
    cutoff_day: "Wednesday",
    image_url:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
    active: true,
    max_subscribers: 80,
    created_at: now,
    updated_at: now,
  },
  {
    id: "box-family",
    farm_id: "farm-linden",
    title: "Family Harvest Box",
    slug: "family-harvest-box",
    description: "A fuller weekly vegetable box for families who cook several meals at home.",
    farmer_message: "We added extra carrots and greenhouse cucumbers this week because the beds are coming in beautifully.",
    price_cents: 5900,
    currency: "usd",
    frequency: "weekly",
    delivery_day: "Friday",
    cutoff_day: "Wednesday",
    image_url:
      "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=80",
    active: true,
    max_subscribers: 60,
    created_at: now,
    updated_at: now,
  },
  {
    id: "box-protein",
    farm_id: "farm-red-barn",
    title: "Pasture Protein Box",
    slug: "pasture-protein-box",
    description: "A curated weekly protein box with pasture-raised cuts selected for practical home cooking.",
    farmer_message: "This week includes grill-friendly cuts and a slow-cooker roast for an easy weekend meal.",
    price_cents: 7500,
    currency: "usd",
    frequency: "weekly",
    delivery_day: "Friday",
    cutoff_day: "Wednesday",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1400&q=80",
    active: true,
    max_subscribers: 45,
    created_at: now,
    updated_at: now,
  },
  {
    id: "box-dairy",
    farm_id: "farm-meadow",
    title: "Egg & Dairy Staples Box",
    slug: "egg-dairy-staples-box",
    description: "A compact weekly box of eggs, butter, cultured dairy, and rotating small-batch staples.",
    farmer_message: "The hens are laying steadily. This box includes extra-rich yogurt from our creamery partner.",
    price_cents: 2900,
    currency: "usd",
    frequency: "weekly",
    delivery_day: "Friday",
    cutoff_day: "Wednesday",
    image_url:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1400&q=80",
    active: true,
    max_subscribers: 100,
    created_at: now,
    updated_at: now,
  },
];

export const demoBoxItems: BoxItem[] = [
  { id: "item-1", box_id: "box-produce", name: "Butter lettuce", quantity: "1 head", sort_order: 1, created_at: now },
  { id: "item-2", box_id: "box-produce", name: "Asparagus", quantity: "1 bunch", sort_order: 2, created_at: now },
  { id: "item-3", box_id: "box-produce", name: "Breakfast radishes", quantity: "1 bunch", sort_order: 3, created_at: now },
  { id: "item-4", box_id: "box-produce", name: "Rhubarb", quantity: "1 lb", sort_order: 4, created_at: now },
  { id: "item-5", box_id: "box-family", name: "Spinach", quantity: "8 oz", sort_order: 1, created_at: now },
  { id: "item-6", box_id: "box-family", name: "Greenhouse cucumbers", quantity: "3", sort_order: 2, created_at: now },
  { id: "item-7", box_id: "box-family", name: "Carrots", quantity: "2 lb", sort_order: 3, created_at: now },
  { id: "item-8", box_id: "box-family", name: "Spring onions", quantity: "1 bunch", sort_order: 4, created_at: now },
  { id: "item-9", box_id: "box-protein", name: "Ground beef", quantity: "2 lb", sort_order: 1, created_at: now },
  { id: "item-10", box_id: "box-protein", name: "Pork shoulder roast", quantity: "2.5 lb", sort_order: 2, created_at: now },
  { id: "item-11", box_id: "box-protein", name: "Chicken thighs", quantity: "2 lb", sort_order: 3, created_at: now },
  { id: "item-12", box_id: "box-dairy", name: "Pasture eggs", quantity: "1 dozen", sort_order: 1, created_at: now },
  { id: "item-13", box_id: "box-dairy", name: "Cultured butter", quantity: "8 oz", sort_order: 2, created_at: now },
  { id: "item-14", box_id: "box-dairy", name: "Whole milk yogurt", quantity: "24 oz", sort_order: 3, created_at: now },
];

export const demoProfiles: Profile[] = [
  {
    id: "profile-customer",
    full_name: "Maya Johnson",
    email: "customer@hurvest.local",
    phone: "612-555-0148",
    role: "customer",
    address_line1: "2248 Bryant Ave S",
    address_line2: null,
    city: "Minneapolis",
    state: "MN",
    zip: "55405",
    delivery_notes: "Leave on covered porch.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "profile-farmer",
    full_name: "Eli Morgan",
    email: "farmer@hurvest.local",
    phone: "507-555-0194",
    role: "farmer",
    address_line1: null,
    address_line2: null,
    city: "Northfield",
    state: "MN",
    zip: "55057",
    delivery_notes: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "profile-admin",
    full_name: "Hurvest Ops",
    email: "admin@hurvest.local",
    phone: "612-555-0176",
    role: "admin",
    address_line1: null,
    address_line2: null,
    city: "Minneapolis",
    state: "MN",
    zip: "55401",
    delivery_notes: null,
    created_at: now,
    updated_at: now,
  },
];

export const demoSubscriptions: Subscription[] = [
  {
    id: "sub-demo",
    user_id: "profile-customer",
    box_id: "box-produce",
    farm_id: "farm-northstar",
    stripe_customer_id: "cus_demo",
    stripe_subscription_id: "sub_demo",
    status: "active",
    frequency: "weekly",
    price_cents: 3900,
    next_delivery_date: "2026-05-22",
    created_at: now,
    updated_at: now,
  },
];

export const demoOrders: Order[] = [
  {
    id: "order-1",
    subscription_id: "sub-demo",
    user_id: "profile-customer",
    farm_id: "farm-northstar",
    box_id: "box-produce",
    delivery_date: "2026-05-22",
    status: "confirmed",
    total_cents: 3900,
    delivery_address: "2248 Bryant Ave S, Minneapolis, MN 55405",
    delivery_notes: "Leave on covered porch.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "order-2",
    subscription_id: "sub-demo",
    user_id: "profile-customer",
    farm_id: "farm-northstar",
    box_id: "box-produce",
    delivery_date: "2026-05-15",
    status: "delivered",
    total_cents: 3900,
    delivery_address: "2248 Bryant Ave S, Minneapolis, MN 55405",
    delivery_notes: "Leave on covered porch.",
    created_at: now,
    updated_at: now,
  },
];

export const demoDeliveryRuns: DeliveryRun[] = [
  {
    id: "run-friday",
    delivery_date: "2026-05-22",
    status: "planning",
    notes: "Confirm final farm counts after Wednesday cutoff. North loop first, Saint Paul second.",
    created_at: now,
    updated_at: now,
  },
];

export function getFarmWithBox(farm: Farm): FarmWithBox {
  const featuredBox = demoBoxes.find((box) => box.farm_id === farm.id) ?? demoBoxes[0];
  return {
    ...farm,
    featuredBox,
    items: demoBoxItems.filter((item) => item.box_id === featuredBox.id),
  };
}

export const demoFarmCards = demoFarms.map(getFarmWithBox);

export function getBoxWithFarm(idOrSlug: string) {
  const box = demoBoxes.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  if (!box) return null;
  const farm = demoFarms.find((item) => item.id === box.farm_id);
  if (!farm) return null;
  return {
    ...box,
    farm,
    items: demoBoxItems.filter((item) => item.box_id === box.id),
  };
}

export function getFarmBySlug(slug: string) {
  const farm = demoFarms.find((item) => item.slug === slug);
  return farm ? getFarmWithBox(farm) : null;
}

