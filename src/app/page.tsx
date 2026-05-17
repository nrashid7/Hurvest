import Link from "next/link";
import { ArrowRight, CalendarCheck, HandHeart, Leaf, PackageCheck, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { FarmCard } from "@/components/farm-card";
import { FeaturedBoxCard } from "@/components/featured-box-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFeaturedBox, listFarmCards } from "@/lib/data";

export default async function Home() {
  const [featuredBox, farms] = await Promise.all([getFeaturedBox(), listFarmCards()]);

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:py-20 lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="mb-5 inline-flex w-fit rounded-full border border-primary/20 bg-card/80 px-4 py-2 text-sm font-medium text-primary">
            Minnesota-first farm subscriptions
          </p>
          <h1 className="max-w-4xl text-balance text-5xl font-bold tracking-normal text-foreground sm:text-7xl">
            Curated farm boxes from local Minnesota farms.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-muted-foreground">
            Subscribe once and get fresh seasonal harvest boxes delivered every Friday.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/farms">
                Browse farm boxes
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/farms">Meet the farms</Link>
            </Button>
          </div>
        </div>
        <div className="grid content-end gap-4 rounded-2xl border bg-card/75 p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl bg-secondary/70 p-4">
              <p className="text-2xl font-semibold">Fri</p>
              <p className="text-muted-foreground">delivery</p>
            </div>
            <div className="rounded-xl bg-secondary/70 p-4">
              <p className="text-2xl font-semibold">Wed</p>
              <p className="text-muted-foreground">cutoff</p>
            </div>
            <div className="rounded-xl bg-secondary/70 p-4">
              <p className="text-2xl font-semibold">1</p>
              <p className="text-muted-foreground">per box</p>
            </div>
          </div>
          <FeaturedBoxCard box={featuredBox} priority />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Featured box" title="One beautiful weekly decision.">
          <p>Each box is curated by one local farm, so you can eat seasonally without sorting through a crowded cart.</p>
        </SectionHeading>
        <div className="mt-8">
          <FeaturedBoxCard box={featuredBox} />
        </div>
      </section>

      <section id="how-it-works" className="bg-card/55 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How Hurvest works" title="Simple enough to operate every week." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {([
              ["Choose a farm box", "Pick one curated subscription from one local farm.", Leaf],
              ["Farmers harvest fresh", "Orders close Wednesday night so farms can prep Thursday.", PackageCheck],
              ["Delivered Friday", "Hurvest coordinates the Friday handoff so your box arrives on a predictable weekly rhythm.", Truck],
            ] as Array<[string, string, LucideIcon]>).map(([title, copy, Icon]) => (
              <Card key={String(title)}>
                <CardContent className="p-6">
                  <Icon className="mb-5 size-9 text-primary" aria-hidden="true" />
                  <h3 className="text-2xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Featured farms" title="Minnesota farms with weekly rhythm." />
          <Button asChild variant="outline">
            <Link href="/farms">View all farms</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] opacity-80">Why local farms</p>
            <h2 className="text-balance text-5xl font-bold tracking-normal">Better food, clearer operations, stronger local revenue.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              [HandHeart, "Recurring support for farms"],
              [CalendarCheck, "Predictable weekly delivery"],
              [ShieldCheck, "Curated quality over aisle chaos"],
            ] as Array<[LucideIcon, string]>).map(([Icon, label]) => (
              <div key={String(label)} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-5">
                <Icon className="mb-4 size-7" aria-hidden="true" />
                <p className="font-medium leading-6">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-5xl font-bold tracking-normal">Start with next Friday’s box.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          Choose a farm, subscribe once, and let Hurvest handle the weekly rhythm.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/farms">Browse farm boxes</Link>
        </Button>
      </section>
    </PageShell>
  );
}
