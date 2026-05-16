export type UserRole = "customer" | "farmer" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "canceled"
  | "incomplete";

export type Frequency = "weekly" | "biweekly" | "monthly";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Farm = {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  story: string;
  location: string;
  city: string;
  state: string;
  image_url: string;
  banner_url: string;
  active: boolean;
  category: "produce" | "meat" | "eggs" | "mixed";
  created_at: string;
  updated_at: string;
};

export type Box = {
  id: string;
  farm_id: string;
  title: string;
  slug: string;
  description: string;
  farmer_message: string;
  price_cents: number;
  currency: "usd";
  frequency: Frequency;
  delivery_day: "Friday";
  cutoff_day: "Wednesday";
  image_url: string;
  active: boolean;
  max_subscribers: number | null;
  created_at: string;
  updated_at: string;
};

export type BoxItem = {
  id: string;
  box_id: string;
  name: string;
  quantity: string | null;
  sort_order: number;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  box_id: string;
  farm_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  frequency: Frequency;
  price_cents: number;
  next_delivery_date: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  subscription_id: string;
  user_id: string;
  farm_id: string;
  box_id: string;
  delivery_date: string;
  status: OrderStatus;
  total_cents: number;
  delivery_address: string;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryRun = {
  id: string;
  delivery_date: string;
  status: "planning" | "active" | "complete";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FarmWithBox = Farm & {
  featuredBox: Box;
  items: BoxItem[];
};

export type BoxWithFarm = Box & {
  farm: Farm;
  items: BoxItem[];
};

