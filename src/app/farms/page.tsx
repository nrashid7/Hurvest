import type { Metadata } from "next";
import Link from "next/link";
import { FarmCard } from "@/components/farm-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { listFarmCards } from "@/lib/data";

export const metadata: Metadata = {
  title: "Minnesota Farm Boxes",
};

const filters = ["all", "produce", "meat", "eggs", "mixed"];

export default async function FarmsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = params.category && params.category !== "all" ? params.category : undefined;
  const farms = await listFarmCards(category);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Farm boxes" title="Choose one farm box for Friday delivery." level="h1">
          <p>No multi-vendor cart, no aisle sprawl. Pick the farm subscription that fits your household.</p>
        </SectionHeading>
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button key={filter} asChild variant={(category ?? "all") === filter ? "default" : "outline"} size="sm">
              <Link href={filter === "all" ? "/farms" : `/farms?category=${filter}`}>{filter}</Link>
            </Button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
