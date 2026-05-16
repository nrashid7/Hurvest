import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Check, Clock, MapPin } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBoxDetail } from "@/lib/data";
import { formatMoney } from "@/lib/format";

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
          <form action={createCheckoutSession} className="mt-6">
            <input type="hidden" name="box_id" value={box.id} />
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Subscribe for {formatMoney(box.price_cents)} weekly
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

