import type { Metadata } from "next";
import Link from "next/link";
import { setSubscriptionStatusAction, updateProfileAction } from "@/app/actions/customer";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentProfile } from "@/lib/auth";
import { getCustomerData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { sanitizeNextPath } from "@/lib/forms";
import { getDeliveryServiceAreaLabel, getSupportEmail } from "@/lib/launch";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; profile?: string; next?: string }>;
}) {
  const query = await searchParams;
  const nextPath = query.next ? sanitizeNextPath(query.next, "/farms") : null;
  const supportEmail = getSupportEmail();
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <PageShell>
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-5xl font-bold">Sign in to manage your box.</h1>
          <p className="mt-4 text-muted-foreground">Your subscription, delivery address, and order history live here.</p>
          <Button asChild className="mt-8">
            <Link href="/login?next=/account">Sign in</Link>
          </Button>
        </section>
      </PageShell>
    );
  }

  const { subscriptions, orders, boxes, farms } = await getCustomerData(profile);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Customer dashboard</p>
          <h1 className="mt-3 text-5xl font-bold tracking-normal">Your Friday deliveries</h1>
        </div>
        {query.checkout === "success" ? (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm">
            Your subscription is confirmed. Your first Friday delivery will appear below after Stripe finishes syncing. Questions? Email{" "}
            <a className="font-medium text-primary" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </div>
        ) : null}
        {query.profile === "required" ? (
          <div className="mb-6 rounded-xl border bg-accent/45 p-4 text-sm">
            Add your delivery profile before subscribing so we know where to bring your Friday box.
            {nextPath ? (
              <Button asChild variant="link" className="ml-1 h-auto p-0">
                <Link href={nextPath}>Return to box</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
        {query.profile === "unsupported-zip" ? (
          <div className="mb-6 rounded-xl border bg-accent/45 p-4 text-sm">
            Your ZIP is outside the current paid beta delivery area. {getDeliveryServiceAreaLabel()}
            {nextPath ? (
              <Button asChild variant="link" className="ml-1 h-auto p-0">
                <Link href={nextPath}>Return to box</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Active subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {subscriptions.length ? (
                  subscriptions.map((subscription) => {
                    const box = boxes.find((item) => item.id === subscription.box_id);
                    const farm = farms.find((item) => item.id === subscription.farm_id);
                    return (
                      <div key={subscription.id} className="rounded-xl border bg-secondary/35 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-xl font-semibold">{box?.title ?? "Farm box"}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{farm?.name} · next delivery {formatDate(subscription.next_delivery_date)}</p>
                            <p className="mt-2 font-medium">{formatMoney(subscription.price_cents)} weekly</p>
                          </div>
                          <StatusBadge status={subscription.status} />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <form action={setSubscriptionStatusAction}>
                            <input type="hidden" name="subscription_id" value={subscription.id} />
                            <input type="hidden" name="status" value="paused" />
                            <Button variant="outline" size="sm">Pause</Button>
                          </form>
                          <form action={setSubscriptionStatusAction}>
                            <input type="hidden" name="subscription_id" value={subscription.id} />
                            <input type="hidden" name="status" value="canceled" />
                            <Button variant="outline" size="sm">Cancel</Button>
                          </form>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <p className="font-medium">No active subscriptions yet.</p>
                    <Button asChild className="mt-4">
                      <Link href="/farms">Browse farm boxes</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Order history</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {orders.map((order) => {
                  const box = boxes.find((item) => item.id === order.box_id);
                  return (
                    <div key={order.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{box?.title ?? "Farm box"}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.delivery_date)} · {formatMoney(order.total_cents)}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Delivery profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{getDeliveryServiceAreaLabel()}</p>
              <form action={updateProfileAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address_line1">Address</Label>
                  <Input id="address_line1" name="address_line1" defaultValue={profile.address_line1 ?? ""} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" defaultValue={profile.city ?? ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" name="zip" defaultValue={profile.zip ?? ""} />
                  </div>
                </div>
                <input type="hidden" name="address_line2" value={profile.address_line2 ?? ""} />
                <input type="hidden" name="state" value={profile.state ?? "MN"} />
                <div className="grid gap-2">
                  <Label htmlFor="delivery_notes">Delivery notes</Label>
                  <Textarea id="delivery_notes" name="delivery_notes" defaultValue={profile.delivery_notes ?? ""} />
                </div>
                <Button type="submit">Save profile</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
