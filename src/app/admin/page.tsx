import type { Metadata } from "next";
import {
  assignFarmOwnerAction,
  createAdminBoxAction,
  createAdminFarmAction,
  updateAdminBoxAction,
  updateAdminFarmAction,
  updateAdminSubscriptionStatusAction,
  updateDeliveryRunAction,
  updateOrderStatusAction,
  updateProfileRoleAction,
} from "@/app/actions/admin";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { farmCategories, frequencies, orderStatuses, serializeBoxItems, subscriptionStatuses, userRoles } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Admin operations",
};

export default async function AdminPage() {
  await requireRole(["admin"]);
  const { profiles, farms, boxes, items, subscriptions, orders, deliveryRuns } = await getAdminData();
  const farmers = profiles.filter((profile) => profile.role === "farmer" || profile.role === "admin");
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "active");
  const nextOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const revenue = activeSubscriptions.reduce((sum, subscription) => sum + subscription.price_cents, 0);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin operations</p>
            <h1 className="mt-3 text-5xl font-bold tracking-normal">Friday control center</h1>
          </div>
          <Button asChild variant="outline">
            <a href="/admin/orders.csv">Export orders CSV</a>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Active farms", farms.filter((farm) => farm.active).length],
            ["Active boxes", boxes.filter((box) => box.active).length],
            ["Subscribers", activeSubscriptions.length],
            ["Weekly revenue", formatMoney(revenue)],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="farms">Farms</TabsTrigger>
            <TabsTrigger value="boxes">Boxes</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="subs">Subs</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Orders and delivery status</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Farm</TableHead>
                      <TableHead>Box</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-52">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length ? orders.map((order) => {
                      const farm = farms.find((item) => item.id === order.farm_id);
                      const box = boxes.find((item) => item.id === order.box_id);
                      return (
                        <TableRow key={order.id}>
                          <TableCell>{formatDate(order.delivery_date)}</TableCell>
                          <TableCell>{farm?.name ?? "Farm"}</TableCell>
                          <TableCell>{box?.title ?? "Box"}</TableCell>
                          <TableCell>{formatMoney(order.total_cents)}</TableCell>
                          <TableCell><StatusBadge status={order.status} /></TableCell>
                          <TableCell>
                            <form action={updateOrderStatusAction} className="flex gap-2">
                              <input type="hidden" name="order_id" value={order.id} />
                              <Select name="status" defaultValue={order.status}>
                                <SelectTrigger aria-label="Order status" className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>{status.replaceAll("_", " ")}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" type="submit">Save</Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No orders have been created yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Delivery coordination</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {deliveryRuns.length ? deliveryRuns.map((run) => (
                  <form key={run.id} action={updateDeliveryRunAction} className="grid gap-4 rounded-xl border p-4">
                    <input type="hidden" name="delivery_run_id" value={run.id} />
                    <div>
                      <p className="font-medium">{formatDate(run.delivery_date)}</p>
                      <p className="text-sm text-muted-foreground">{nextOrders.length} orders need coordination</p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select name="status" defaultValue={run.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`notes-${run.id}`}>Manual logistics notes</Label>
                      <Textarea id={`notes-${run.id}`} name="notes" defaultValue={run.notes ?? ""} rows={5} />
                    </div>
                    <Button type="submit">Save run</Button>
                  </form>
                )) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No delivery run is scheduled yet.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farms" className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
            <div className="grid gap-6">
              {farms.map((farm) => (
                <Card key={farm.id}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{farm.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-5">
                    <form action={assignFarmOwnerAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <input type="hidden" name="farm_id" value={farm.id} />
                      <Select name="owner_id" defaultValue={farm.owner_id ?? "unassigned"}>
                        <SelectTrigger aria-label="Farm owner" className="h-10 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {farmers.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>{profile.full_name ?? profile.email ?? profile.id}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="submit" variant="outline">Assign owner</Button>
                    </form>

                    <form action={updateAdminFarmAction} className="grid gap-4">
                      <input type="hidden" name="farm_id" value={farm.id} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input name="name" defaultValue={farm.name} aria-label="Farm name" />
                        <Input name="slug" defaultValue={farm.slug} aria-label="Farm slug" />
                        <Input name="location" defaultValue={farm.location} aria-label="Location" />
                        <Input name="city" defaultValue={farm.city} aria-label="City" />
                        <Input name="state" defaultValue={farm.state} aria-label="State" />
                        <Input name="image_url" defaultValue={farm.image_url} aria-label="Image URL" />
                      </div>
                      <Input name="banner_url" defaultValue={farm.banner_url} aria-label="Banner URL" />
                      <Textarea name="short_description" defaultValue={farm.short_description} aria-label="Short description" />
                      <Textarea name="story" defaultValue={farm.story} rows={4} aria-label="Farm story" />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Select name="category" defaultValue={farm.category}>
                          <SelectTrigger aria-label="Farm category" className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {farmCategories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <label className="flex items-center gap-3 rounded-lg border px-3 py-2">
                          <span className="text-sm font-medium">Active</span>
                          <Switch name="active" defaultChecked={farm.active} />
                        </label>
                        <Button type="submit">Save farm</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Add farm</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createAdminFarmAction} className="grid gap-4">
                  <Input name="name" placeholder="Farm name" />
                  <Input name="slug" placeholder="farm-slug" />
                  <Input name="location" placeholder="Northfield, MN" />
                  <Input name="city" placeholder="Northfield" />
                  <Input name="state" defaultValue="Minnesota" />
                  <Select name="category" defaultValue="mixed">
                    <SelectTrigger aria-label="Farm category" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farmCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input name="image_url" placeholder="Image URL" />
                  <Input name="banner_url" placeholder="Banner URL" />
                  <Textarea name="short_description" placeholder="Short description" />
                  <Textarea name="story" placeholder="Farm story" rows={5} />
                  <Button type="submit">Create farm</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boxes" className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
            <div className="grid gap-6">
              {boxes.map((box) => {
                const farm = farms.find((item) => item.id === box.farm_id);
                const boxItems = items.filter((item) => item.box_id === box.id);
                return (
                  <Card key={box.id}>
                    <CardHeader>
                      <CardTitle className="text-2xl">{box.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form action={updateAdminBoxAction} className="grid gap-4">
                        <input type="hidden" name="box_id" value={box.id} />
                        <p className="text-sm text-muted-foreground">{farm?.name ?? "Farm"}</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input name="title" defaultValue={box.title} aria-label="Box title" />
                          <Input name="slug" defaultValue={box.slug} aria-label="Box slug" />
                          <Input name="price_cents" type="number" defaultValue={box.price_cents} aria-label="Price cents" />
                          <Input name="max_subscribers" type="number" defaultValue={box.max_subscribers ?? ""} aria-label="Max subscribers" />
                        </div>
                        <Input name="image_url" defaultValue={box.image_url} aria-label="Image URL" />
                        <Textarea name="description" defaultValue={box.description} aria-label="Description" />
                        <Textarea name="farmer_message" defaultValue={box.farmer_message} aria-label="Farmer message" />
                        <Textarea name="items" rows={5} defaultValue={serializeBoxItems(boxItems)} aria-label="Box items" />
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <Select name="frequency" defaultValue={box.frequency}>
                            <SelectTrigger aria-label="Frequency" className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencies.map((frequency) => (
                                <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-3 rounded-lg border px-3 py-2">
                            <span className="text-sm font-medium">Active</span>
                            <Switch name="active" defaultChecked={box.active} />
                          </label>
                          <Button type="submit">Save box</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Add box</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createAdminBoxAction} className="grid gap-4">
                  <Select name="farm_id" defaultValue={farms[0]?.id}>
                    <SelectTrigger aria-label="Farm" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input name="title" placeholder="Box title" />
                  <Input name="slug" placeholder="box-slug" />
                  <Input name="price_cents" type="number" placeholder="3900" />
                  <Input name="max_subscribers" type="number" placeholder="80" />
                  <Input name="image_url" placeholder="Image URL" />
                  <Select name="frequency" defaultValue="weekly">
                    <SelectTrigger aria-label="Frequency" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea name="description" placeholder="Description" />
                  <Textarea name="farmer_message" placeholder="Farmer message" />
                  <Textarea name="items" placeholder="1 bunch | Radishes" rows={5} />
                  <Button type="submit">Create box</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="people" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Profiles and roles</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="min-w-52">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length ? profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.full_name ?? "Customer"}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.role}</TableCell>
                        <TableCell>
                          <form action={updateProfileRoleAction} className="flex gap-2">
                            <input type="hidden" name="profile_id" value={profile.id} />
                            <Select name="role" defaultValue={profile.role}>
                              <SelectTrigger aria-label="User role" className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {userRoles.map((role) => (
                                  <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" type="submit">Save</Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No profiles exist yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Farm</TableHead>
                      <TableHead>Box</TableHead>
                      <TableHead>Next delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-52">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length ? subscriptions.map((subscription) => {
                      const profile = profiles.find((item) => item.id === subscription.user_id);
                      const farm = farms.find((item) => item.id === subscription.farm_id);
                      const box = boxes.find((item) => item.id === subscription.box_id);
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>{profile?.full_name ?? profile?.email ?? "Customer"}</TableCell>
                          <TableCell>{farm?.name ?? "Farm"}</TableCell>
                          <TableCell>{box?.title ?? "Box"}</TableCell>
                          <TableCell>{formatDate(subscription.next_delivery_date)}</TableCell>
                          <TableCell><StatusBadge status={subscription.status} /></TableCell>
                          <TableCell>
                            <form action={updateAdminSubscriptionStatusAction} className="flex gap-2">
                              <input type="hidden" name="subscription_id" value={subscription.id} />
                              <Select name="status" defaultValue={subscription.status}>
                                <SelectTrigger aria-label="Subscription status" className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {subscriptionStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" type="submit">Save</Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No subscriptions have been synced yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
}
