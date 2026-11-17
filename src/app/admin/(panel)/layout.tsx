import { AdminShell } from "@/components/admin/shell";
import { Background } from "@/components/effects/background";
import { requireAdmin } from "@/server/auth";
import { countUnreadMessages } from "@/server/messages";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = await countUnreadMessages().catch(() => 0);

  return (
    <>
      <Background />
      <AdminShell username={admin.username} unread={unread}>
        {children}
      </AdminShell>
    </>
  );
}
