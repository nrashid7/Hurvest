import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createBoxAction, updateBoxAction, updateFarmAction } from "@/app/actions/farmer";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { getFarmerData } from "@/lib/data";
import { farmCategories, frequencies, serializeBoxItems } from "@/lib/forms";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Farmer dashboard",
};

export default async function FarmerPage() {
  const profile = await requireRole(["farmer", "admin"]);
  const { farms, boxes, items, subscriptions, orders } = await getFarmerData(profile);
  const farm = farms[0];

  if (!farm) redirect("/farmer/onboarding");

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Farmer dashboard</p>
        <h1 className="mt-3 text-5xl font-bold tracking-normal">Manage your farm and offerings</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Farm profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateFarmAction} className="grid gap-4">
                  <input type="hidden" name="farm_id" value={farm.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Farm name</Label>
                      <Input id="name" name="name" defaultValue={farm.name} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="slug">Public URL slug</Label>
                      <Input id="slug" name="slug" defaultValue={farm.slug} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" defaultValue={farm.location} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" defaultValue={farm.city} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" defaultValue={farm.state} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Select name="category" defaultValue={farm.category}>
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
                    <Input id="image_url" name="image_url" defaultValue={farm.image_url} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="banner_url">Banner image URL</Label>
                    <Input id="banner_url" name="banner_url" defaultValue={farm.banner_url} />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Create offering</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createBoxAction} className="grid gap-4">
                  <input type="hidden" name="farm_id" value={farm.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input name="title" placeholder="Friday Produce Box" required />
                    <Input name="slug" placeholder="friday-produce-box" />
                    <Input name="price_cents" type="number" min="1" placeholder="3900" required />
                    <Input name="max_subscribers" type="number" min="0" placeholder="80" />
                  </div>
                  <Input name="image_url" type="url" placeholder="Image URL" required />
                  <Select name="frequency" defaultValue="weekly">
                    <SelectTrigger aria-label="Frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea name="description" placeholder="What customers receive each delivery" required />
                  <Textarea name="farmer_message" placeholder="This week's farmer note" required />
                  <Textarea name="items" placeholder="1 bunch | Radishes" rows={5} />
                  <Button type="submit">Publish offering</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            {boxes.length ? boxes.map((box) => {
              const boxItems = items.filter((item) => item.box_id === box.id);
              return (
                <Card key={box.id}>
                  <CardHeader>
                    <CardTitle className="text-3xl">{box.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form action={updateBoxAction} className="grid gap-4">
                      <input type="hidden" name="box_id" value={box.id} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`title-${box.id}`}>Box title</Label>
                          <Input id={`title-${box.id}`} name="title" defaultValue={box.title} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`slug-${box.id}`}>Box slug</Label>
                          <Input id={`slug-${box.id}`} name="slug" defaultValue={box.slug} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`price-${box.id}`}>Weekly price in cents</Label>
                          <Input id={`price-${box.id}`} name="price_cents" type="number" defaultValue={box.price_cents} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`capacity-${box.id}`}>Max subscribers</Label>
                          <Input id={`capacity-${box.id}`} name="max_subscribers" type="number" defaultValue={box.max_subscribers ?? ""} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`image-${box.id}`}>Image URL</Label>
                        <Input id={`image-${box.id}`} name="image_url" defaultValue={box.image_url} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Frequency</Label>
                        <Select name="frequency" defaultValue={box.frequency}>
                          <SelectTrigger aria-label="Frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencies.map((frequency) => (
                              <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`description-${box.id}`}>Description</Label>
                        <Textarea id={`description-${box.id}`} name="description" defaultValue={box.description} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`message-${box.id}`}>Farmer message</Label>
                        <Textarea id={`message-${box.id}`} name="farmer_message" defaultValue={box.farmer_message} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`items-${box.id}`}>Included items</Label>
                        <Textarea id={`items-${box.id}`} name="items" rows={6} defaultValue={serializeBoxItems(boxItems)} placeholder="1 bunch | Radishes" />
                      </div>
                      <label className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">Box available</span>
                        <Switch name="active" defaultChecked={box.active} />
                      </label>
                      <Button type="submit">Save offering</Button>
                    </form>
                  </CardContent>
                </Card>
              );
            }) : (
              <Card>
                <CardContent className="p-6 text-muted-foreground">Create your first offering to start appearing in the marketplace.</CardContent>
              </Card>
            )}

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
                {orders.length ? orders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{formatDate(order.delivery_date)}</p>
                      <p className="text-sm text-muted-foreground">{formatMoney(order.total_cents)} - {order.delivery_address}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                )) : (
                  <p className="text-muted-foreground">No upcoming orders yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
