import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/password-form";
import { PageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader
        title="Account"
        description={
          <>
            Signed in as <span className="font-medium text-foreground">{admin.username}</span>. This is the same
            account as the previous admin site, so a new password works there too.
          </>
        }
      />
      <PasswordForm />
    </>
  );
}
