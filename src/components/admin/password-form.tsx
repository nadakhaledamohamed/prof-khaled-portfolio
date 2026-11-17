"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2, CircleAlert, KeyRound, LoaderCircle } from "lucide-react";
import { changePasswordAction, type PasswordState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function PasswordForm() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<PasswordState, FormData>(async (prev, data) => {
    const result = await changePasswordAction(prev, data);
    if (result.ok) formRef.current?.reset();
    return result;
  }, {});

  return (
    <form ref={formRef} action={action} className="glass grid max-w-lg gap-5 rounded-3xl p-5 sm:p-7">
      <div>
        <Label htmlFor="current">Current password</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <Label htmlFor="next">New password</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" minLength={10} required />
        <p className="mt-1.5 text-xs text-muted-foreground">At least 10 characters.</p>
      </div>
      <div>
        <Label htmlFor="confirm">Repeat the new password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </div>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <CheckCircle2 className="size-4" aria-hidden /> Password updated.
        </p>
      )}

      <Button type="submit" variant="brand" disabled={pending} className="w-fit">
        {pending ? <LoaderCircle className="animate-spin" /> : <KeyRound />} Change password
      </Button>
    </form>
  );
}
