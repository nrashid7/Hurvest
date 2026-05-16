import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { FeaturedBoxCard } from "@/components/featured-box-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { getFarmDetail } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const farm = await getFarmDetail(slug);
  return { title: farm?.name ?? "Farm" };
}

export default async function FarmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const farm = await getFarmDetail(slug);
  if (!farm) notFound();

  const box = {
    ...farm.featuredBox,
    farm,
    items: farm.items,
  };

  return (
    <PageShell>
      <section className="relative min-h-[420px] overflow-hidden">
        <Image src={farm.banner_url} alt={`${farm.name} fields`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/55 to-transparent" />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end px-4 py-12 text-primary-foreground sm:px-6 lg:px-8">
          <Badge className="mb-4 w-fit bg-primary-foreground/90 text-primary">{farm.category}</Badge>
          <h1 className="max-w-3xl text-balance text-6xl font-bold tracking-normal">{farm.name}</h1>
          <p className="mt-4 flex items-center gap-2 text-lg">
            <MapPin className="size-5" aria-hidden="true" />
            {farm.location}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionHeading eyebrow="Farm story" title="A box with a person behind it." />
        </div>
        <div className="text-lg leading-9 text-muted-foreground">
          <p>{farm.story}</p>
          <div className="mt-8 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Delivery details</p>
              <p className="mt-2 flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                Friday delivery, Wednesday cutoff
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">This week</p>
              <p className="mt-2">{farm.featuredBox.farmer_message}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <FeaturedBoxCard box={box} />
      </section>
    </PageShell>
  );
}

