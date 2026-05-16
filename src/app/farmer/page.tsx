import type { Metadata } from "next";
import { updateBoxAction, updateFarmAction } from "@/app/actions/farmer";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { getFarmerData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { serializeBoxItems } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Farmer dashboard",
};

export default async function FarmerPage() {
  const profile = await requireRole(["farmer", "admin"]);
  const { farms, boxes, items, subscriptions, orders } = await getFarmerData(profile);
  const farm = farms[0];
  const box = boxes.find((item) => item.farm_id === farm?.id);
  const boxItems = items.filter((item) => item.box_id === box?.id);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Farmer dashboard</p>
        <h1 className="mt-3 text-5xl font-bold tracking-normal">Manage this week’s box</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Farm profile</CardTitle>
              </CardHeader>
              <CardContent>
                {farm ? (
                  <form action={updateFarmAction} className="grid gap-4">
                    <input type="hidden" name="farm_id" value={farm.id} />
                    <div className="grid gap-2">
                      <Label htmlFor="name">Farm name</Label>
                      <Input id="name" name="name" defaultValue={farm.name} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" defaultValue={farm.location} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="short_description">Short description</Label>
                      <Textarea id="short_description" name="short_description" defaultValue={farm.short_description} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="story">Farm story</Label>
                      <Textarea id="story" name="story" rows={6} defaultValue={farm.story} />
                    </div>
                    <label className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium">Accepting subscriptions</span>
                      <Switch name="active" defaultChecked={farm.active} />
                    </label>
                    <Button type="submit">Save farm</Button>
                  </form>
                ) : (
                  <p className="text-muted-foreground">No farm assigned yet. Ask an admin to connect your profile to a farm.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Curated box</CardTitle>
              </CardHeader>
              <CardContent>
                {box ? (
                  <form action={updateBoxAction} className="grid gap-4">
                    <input type="hidden" name="box_id" value={box.id} />
                    <div className="grid gap-2">
                      <Label htmlFor="title">Box title</Label>
                      <Input id="title" name="title" defaultValue={box.title} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price_cents">Weekly price in cents</Label>
                      <Input id="price_cents" name="price_cents" type="number" defaultValue={box.price_cents} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={box.description} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="farmer_message">Farmer message</Label>
                      <Textarea id="farmer_message" name="farmer_message" defaultValue={box.farmer_message} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="items">Weekly included items</Label>
                      <Textarea id="items" name="items" rows={6} defaultValue={serializeBoxItems(boxItems)} placeholder="1 bunch | Radishes" />
                    </div>
                    <label className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium">Box available</span>
                      <Switch name="active" defaultChecked={box.active} />
                    </label>
                    <Button type="submit">Save box</Button>
                  </form>
                ) : (
                  <p className="text-muted-foreground">No curated box exists for this farm yet.</p>
                )}
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                  <p className="mt-2 text-4xl font-semibold">{subscriptions.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Upcoming orders</p>
                  <p className="mt-2 text-4xl font-semibold">{orders.length}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Upcoming farm orders</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{formatDate(order.delivery_date)}</p>
                      <p className="text-sm text-muted-foreground">{formatMoney(order.total_cents)} · {order.delivery_address}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
