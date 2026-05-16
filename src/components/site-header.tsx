import Link from "next/link";
import { Sprout } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg">Hurvest</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link className="transition hover:text-foreground" href="/farms">
            Farms
          </Link>
          <Link className="transition hover:text-foreground" href="/#how-it-works">
            How it works
          </Link>
          <Link className="transition hover:text-foreground" href="/farmer">
            Farmers
          </Link>
          <Link className="transition hover:text-foreground" href="/admin">
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/account">Account</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/farms">Browse boxes</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

