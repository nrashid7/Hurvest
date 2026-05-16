import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { nextDeliveryDate } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = createSupabaseAdminClient();

  if (!stripe || !supabase || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 501 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    if (subscriptionId && session.metadata?.user_id && session.metadata.box_id && session.metadata.farm_id) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const item = subscription.items.data[0];

      await supabase.from("subscriptions").upsert({
        user_id: session.metadata.user_id,
        box_id: session.metadata.box_id,
        farm_id: session.metadata.farm_id,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        frequency: "weekly",
        price_cents: item?.price.unit_amount ?? 0,
        next_delivery_date: nextDeliveryDate().toISOString().slice(0, 10),
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase
      .from("subscriptions")
      .update({ status: subscription.status })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}

