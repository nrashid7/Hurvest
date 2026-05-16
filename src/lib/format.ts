import { addDays, format, isWednesday, nextFriday } from "date-fns";

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "EEE, MMM d");
}

export function nextDeliveryDate(from = new Date()) {
  const friday = nextFriday(from);
  return isWednesday(from) && from.getHours() >= 22 ? addDays(friday, 7) : friday;
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

