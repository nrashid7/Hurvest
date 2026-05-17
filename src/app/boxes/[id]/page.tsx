import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Check, Clock, MapPin } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBoxDetail, listBoxSubscriptions } from "@/lib/data";
import { formatDate, formatMoney, nextDeliveryDate } from "@/lib/format";
import { getBoxCapacityStatus, getDeliveryServiceAreaLabel, getSupportEmail } from "@/lib/launch";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const box = await getBoxDetail(id);
  return { title: box?.title ?? "Farm Box" };
}

export default async function BoxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const box = await getBoxDetail(id);
  if (!box) notFound();
  const capacity = getBoxCapacityStatus(box, await listBoxSubscriptions(box.id));
  const isSoldOut = capacity.state === "sold-out";
  const supportEmail = getSupportEmail();

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <div className="relative min-h-[420px] overflow-hidden rounded-2xl border">
          <Image src={box.image_url} alt={box.title} fill priority className="object-cover" sizes="(min-width: 1024px) 55vw, 100vw" />
        </div>
        <div className="flex flex-col justify-center">
          <Badge className="mb-4 w-fit bg-accent text-accent-foreground">Subscription-first farm box</Badge>
          <h1 className="text-balance text-6xl font-bold tracking-normal">{box.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            {box.farm.name} · {box.farm.location}
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{box.description}</p>
          <div className="mt-8 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-semibold">{formatMoney(box.price_cents)}</p>
              <p className="text-sm text-muted-foreground">weekly</p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-medium">
                <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                {box.delivery_day}
              </p>
              <p className="text-sm text-muted-foreground">delivery day</p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-medium">
                <Clock className="size-5 text-primary" aria-hidden="true" />
                {box.cutoff_day}
              </p>
              <p className="text-sm text-muted-foreground">order cutoff</p>
            </div>
          </div>
          {query.checkout === "missing-stripe" ? (
            <p className="mt-4 rounded-lg bg-accent/45 p-4 text-sm">
              Stripe credentials are not configured yet. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_APP_URL` to enable live checkout.
            </p>
          ) : null}
          {query.checkout === "sold-out" ? (
            <p className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              This box is sold out for the current launch cohort. Choose another farm box or check back after capacity opens.
            </p>
          ) : null}
          <div className="mt-4 rounded-lg border bg-secondary/35 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Next delivery: {formatDate(nextDeliveryDate())}</p>
            <p className="mt-1">Orders close Wednesday night. You can pause or cancel from your account after subscribing.</p>
            <p className="mt-1">{capacity.label}</p>
            <p className="mt-1">{getDeliveryServiceAreaLabel()}</p>
            <p className="mt-1">Need help? <a className="font-medium text-primary" href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
          </div>
          <form action={createCheckoutSession} className="mt-6">
            <input type="hidden" name="box_id" value={box.id} />
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSoldOut}>
              {isSoldOut ? "Sold out" : `Subscribe for ${formatMoney(box.price_cents)} weekly`}
            </Button>
          </form>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold">What’s included this week</h2>
            <ul className="mt-5 grid gap-3">
              {box.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-lg bg-secondary/55 p-3">
                  <Check className="size-5 text-primary" aria-hidden="true" />
                  <span>{item.quantity ? `${item.quantity} ${item.name}` : item.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold">Farmer note</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{box.farmer_message}</p>
            <p className="mt-6 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              One farm per checkout keeps operations clean and helps each farm plan harvest, packing, and Friday handoff.
            </p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
