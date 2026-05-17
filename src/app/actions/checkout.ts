"use server";

import { redirect } from "next/navigation";
import { absoluteUrl, nextDeliveryDate } from "@/lib/format";
import { getBoxDetail, listBoxSubscriptions } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { getBoxCapacityStatus, getStripeRecurringForFrequency, hasCompleteDeliveryProfile, isSupportedDeliveryZip } from "@/lib/launch";
import { getStripe } from "@/lib/stripe";

export async function createCheckoutSession(formData: FormData) {
  const boxId = String(formData.get("box_id") ?? "");
  const box = await getBoxDetail(boxId);
  const profile = await getCurrentProfile();

  if (!box) redirect("/farms?error=box-not-found");
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/boxes/${boxId}`)}`);
  if (!hasCompleteDeliveryProfile(profile)) {
    redirect(`/account?profile=required&next=${encodeURIComponent(`/boxes/${boxId}`)}`);
  }
  if (!isSupportedDeliveryZip(profile.zip)) {
    redirect(`/account?profile=unsupported-zip&next=${encodeURIComponent(`/boxes/${boxId}`)}`);
  }

  const capacity = getBoxCapacityStatus(box, await listBoxSubscriptions(box.id));
  if (capacity.state === "sold-out") redirect(`/boxes/${boxId}?checkout=sold-out`);

  const stripe = getStripe();
  if (!stripe) redirect(`/boxes/${boxId}?checkout=missing-stripe`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: profile.email ?? undefined,
    success_url: absoluteUrl(`/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: absoluteUrl(`/boxes/${boxId}?checkout=cancelled`),
    line_items: [
      {
        price_data: {
          currency: box.currency,
          unit_amount: box.price_cents,
          recurring: getStripeRecurringForFrequency(box.frequency),
          product_data: {
            name: `${box.title} from ${box.farm.name}`,
            description: box.description,
            images: [box.image_url],
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        user_id: profile.id,
        box_id: box.id,
        farm_id: box.farm_id,
        frequency: box.frequency,
        next_delivery_date: nextDeliveryDate().toISOString().slice(0, 10),
      },
    },
    metadata: {
      user_id: profile.id,
      box_id: box.id,
      farm_id: box.farm_id,
      frequency: box.frequency,
    },
  });

  redirect(session.url ?? `/boxes/${boxId}?checkout=failed`);
}
