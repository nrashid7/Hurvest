import Link from "next/link";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ error, next = "/account" }: { error?: string; next?: string }) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <h1 className="text-3xl font-bold tracking-normal">Welcome back</h1>
      </CardHeader>
      <CardContent>
        <form action={signInAction} className="grid gap-5">
          <input type="hidden" name="next" value={next} />
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg">Sign in</Button>
          <p className="text-sm text-muted-foreground">
            New to Hurvest? <Link className="font-medium text-primary" href="/signup">Create an account</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function SignUpForm({ error }: { error?: string }) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <h1 className="text-3xl font-bold tracking-normal">Start your Friday box</h1>
      </CardHeader>
      <CardContent>
        <form action={signUpAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" autoComplete="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">Account type</legend>
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <input name="account_type" type="radio" value="customer" defaultChecked className="size-4 accent-primary" />
              <span>
                <span className="block font-medium">Customer</span>
                <span className="block text-sm text-muted-foreground">Subscribe to local farm boxes.</span>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <input name="account_type" type="radio" value="farmer" className="size-4 accent-primary" />
              <span>
                <span className="block font-medium">Farmer</span>
                <span className="block text-sm text-muted-foreground">Create a farm profile and sell boxes.</span>
              </span>
            </label>
          </fieldset>
          {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg">Create account</Button>
        </form>
      </CardContent>
    </Card>
  );
}
