"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateOrderStatusAction(formData: FormData) {
  await requireRole(["admin"]);
  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "confirmed");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin?demo=1");

  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin");
}

export async function updateDeliveryRunAction(formData: FormData) {
  await requireRole(["admin"]);
  const runId = String(formData.get("delivery_run_id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin?demo=1");

  await supabase
    .from("delivery_runs")
    .update({
      status: String(formData.get("status") ?? "planning"),
      notes: String(formData.get("notes") ?? ""),
    })
    .eq("id", runId);

  revalidatePath("/admin");
}

