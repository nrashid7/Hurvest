import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SignUpForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SignUpForm error={params.error} />
      </section>
    </PageShell>
  );
}

