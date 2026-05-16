import type { Metadata } from "next";
import { updateDeliveryRunAction, updateOrderStatusAction } from "@/app/actions/admin";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin operations",
};

const orderStatuses: OrderStatus[] = ["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"];

export default async function AdminPage() {
  await requireRole(["admin"]);
  const { farms, boxes, subscriptions, orders, deliveryRuns } = await getAdminData();
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
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
                  {orders.map((order) => {
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
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Delivery coordination</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {deliveryRuns.map((run) => (
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
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Farm and box overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {farms.map((farm) => {
                  const farmBoxes = boxes.filter((box) => box.farm_id === farm.id);
                  return (
                    <div key={farm.id} className="rounded-lg border p-4">
                      <p className="font-medium">{farm.name}</p>
                      <p className="text-sm text-muted-foreground">{farmBoxes.length} curated box · {farm.active ? "active" : "inactive"}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

