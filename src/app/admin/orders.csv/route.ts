import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/data";
import { buildOrdersCsvRows } from "@/lib/launch";

function csvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireRole(["admin"]);
  const { orders, profiles, farms, boxes } = await getAdminData();
  const rows = buildOrdersCsvRows({ orders, profiles, farms, boxes });

  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="hurvest-orders.csv"',
    },
  });
}
