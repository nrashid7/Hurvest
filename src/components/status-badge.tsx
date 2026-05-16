import { Badge } from "@/components/ui/badge";
import type { OrderStatus, SubscriptionStatus } from "@/lib/types";

const statusLabels: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  paused: "Paused",
  canceled: "Canceled",
  incomplete: "Incomplete",
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus | SubscriptionStatus | string }) {
  const variant = status === "active" || status === "confirmed" || status === "delivered" ? "default" : "secondary";
  return <Badge variant={variant}>{statusLabels[status] ?? status}</Badge>;
}

