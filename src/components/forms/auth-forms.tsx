import Link from "next/link";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ error, next = "/account" }: { error?: string; next?: string }) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-3xl">Welcome back</CardTitle>
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
        <CardTitle className="text-3xl">Start your Friday box</CardTitle>
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
          {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg">Create account</Button>
        </form>
      </CardContent>
    </Card>
  );
}

