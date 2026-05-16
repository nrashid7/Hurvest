import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-5xl font-bold">This box isn’t in the harvest.</h1>
        <p className="mt-4 text-muted-foreground">The page may have moved, or the farm box is no longer active.</p>
        <Button asChild className="mt-8">
          <Link href="/farms">Browse farm boxes</Link>
        </Button>
      </section>
    </PageShell>
  );
}

