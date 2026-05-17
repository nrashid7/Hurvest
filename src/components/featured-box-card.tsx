import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, Truck } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import type { BoxWithFarm } from "@/lib/types";

export function FeaturedBoxCard({ box, priority = false }: { box: BoxWithFarm; priority?: boolean }) {
  const isSoldOut = box.capacity?.state === "sold-out";

  return (
    <Card className="grid overflow-hidden border-primary/15 bg-card shadow-xl shadow-primary/5 md:grid-cols-[1.05fr_0.95fr]">
      <div className="relative min-h-[320px]">
        <Image src={box.image_url} alt={box.title} fill priority={priority} className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
      <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
        <div>
          <Badge className="mb-4 bg-accent text-accent-foreground">Most popular Friday box</Badge>
          <h3 className="text-4xl font-bold tracking-normal text-foreground">{box.title}</h3>
          <p className="mt-2 text-lg text-muted-foreground">by {box.farm.name}</p>
          <p className="mt-5 text-base leading-7 text-muted-foreground">{box.description}</p>
          {box.capacity ? (
            <p className="mt-4 w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {box.capacity.label}
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
              Delivered every {box.delivery_day}
            </div>
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-primary" aria-hidden="true" />
              Orders close {box.cutoff_day} night
            </div>
          </div>
          <ul className="mt-6 grid gap-2 text-sm">
            {box.items.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <Check className="size-4 text-primary" aria-hidden="true" />
                {item.quantity ? `${item.quantity} ${item.name}` : item.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-secondary/55 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-3xl font-semibold">{formatMoney(box.price_cents)}</p>
            <p className="text-sm text-muted-foreground">weekly subscription</p>
          </div>
          <form action={createCheckoutSession}>
            <input type="hidden" name="box_id" value={box.id} />
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSoldOut}>
              {isSoldOut ? "Sold out" : "Subscribe"}
            </Button>
          </form>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href={`/boxes/${box.id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
