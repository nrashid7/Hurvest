import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SignInForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SignInForm error={params.error} next={params.next} />
      </section>
    </PageShell>
  );
}

