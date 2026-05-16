"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <section className="max-w-xl text-center">
        <h1 className="text-5xl font-bold">Something needs another pass.</h1>
        <p className="mt-4 text-muted-foreground">Try again, or return to the farm boxes while we steady the page.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/farms">Browse boxes</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

