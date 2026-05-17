import Link from "next/link";
import { Sprout } from "lucide-react";
import { getSupportEmail } from "@/lib/launch";

export function SiteFooter() {
  const supportEmail = getSupportEmail();

  return (
    <footer className="border-t border-border/70 bg-card/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Sprout className="size-5" aria-hidden="true" />
            Hurvest
          </div>
          <p className="max-w-md leading-6">
            Curated Friday farm boxes from Minnesota farms, built for simple subscriptions and dependable local delivery.
          </p>
        </div>
        <div className="grid gap-2">
          <p className="font-medium text-foreground">Customers</p>
          <Link href="/farms">Browse farms</Link>
          <Link href="/account">Account dashboard</Link>
          <Link href="/signup">Create account</Link>
          <a href={`mailto:${supportEmail}`}>Support</a>
        </div>
        <div className="grid gap-2">
          <p className="font-medium text-foreground">Operations</p>
          <Link href="/farmer">For farmers</Link>
        </div>
      </div>
    </footer>
  );
}
