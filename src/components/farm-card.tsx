import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import type { FarmWithBox } from "@/lib/types";

export function FarmCard({ farm }: { farm: FarmWithBox }) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={farm.image_url} alt={`${farm.name} farm`} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
        <Badge className="absolute left-4 top-4 bg-background/90 text-foreground backdrop-blur">{farm.category}</Badge>
      </div>
      <CardContent className="grid gap-4 p-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {farm.location}
          </div>
          <h3 className="text-2xl font-bold tracking-normal">{farm.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{farm.short_description}</p>
        </div>
        <div className="rounded-lg border bg-secondary/50 p-4">
          <p className="text-sm font-medium">{farm.featuredBox.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatMoney(farm.featuredBox.price_cents)} weekly · Friday delivery
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/farms/${farm.slug}`}>
            View farm box
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

