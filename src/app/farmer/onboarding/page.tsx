import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createFarmAction } from "@/app/actions/farmer";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { getFarmerData } from "@/lib/data";
import { farmCategories } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Farmer onboarding",
};

export default async function FarmerOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [profile, params] = await Promise.all([requireRole(["farmer", "admin"]), searchParams]);
  const { farms } = await getFarmerData(profile);

  if (farms.length) redirect("/farmer");

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Farmer onboarding</p>
        <h1 className="mt-3 text-5xl font-bold tracking-normal">Create your public farm profile</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Your farm goes live as soon as you save it. You can add your first box from the farmer dashboard next.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-3xl">Farm details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createFarmAction} className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Farm name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Public URL slug</Label>
                  <Input id="slug" name="slug" placeholder="northstar-produce" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="Northfield, MN" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" defaultValue="Minnesota" required />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select name="category" defaultValue="mixed">
                    <SelectTrigger aria-label="Farm category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farmCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image_url">Card image URL</Label>
                <Input id="image_url" name="image_url" type="url" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="banner_url">Banner image URL</Label>
                <Input id="banner_url" name="banner_url" type="url" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="short_description">Short description</Label>
                <Textarea id="short_description" name="short_description" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="story">Farm story</Label>
                <Textarea id="story" name="story" rows={6} required />
              </div>
              {params.error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p> : null}
              <Button type="submit" size="lg">Publish farm</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
