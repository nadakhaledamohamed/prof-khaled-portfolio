"use client";

import { useActionState } from "react";
import { CircleAlert, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { loginAction, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="grid gap-5">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required autoFocus />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <input type="checkbox" name="remember" className="size-4 accent-[var(--primary)]" />
        Keep me signed in for 14 days
      </label>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <Button type="submit" variant="brand" size="lg" disabled={pending} aria-busy={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        Sign in
      </Button>
    </form>
  );
}
