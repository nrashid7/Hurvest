import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/data";

function csvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireRole(["admin"]);
  const { orders, farms, boxes } = await getAdminData();
  const rows = [
    ["order_id", "delivery_date", "farm", "box", "status", "total_cents", "delivery_address", "delivery_notes"],
    ...orders.map((order) => [
      order.id,
      order.delivery_date,
      farms.find((farm) => farm.id === order.farm_id)?.name ?? "",
      boxes.find((box) => box.id === order.box_id)?.title ?? "",
      order.status,
      order.total_cents,
      order.delivery_address,
      order.delivery_notes ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="hurvest-orders.csv"',
    },
  });
}

