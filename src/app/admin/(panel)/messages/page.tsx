import type { Metadata } from "next";
import { DbError } from "@/components/admin/db-error";
import { MessagesList, type MessageView } from "@/components/admin/messages-list";
import { PageHeader } from "@/components/admin/shell";
import { listMessages } from "@/server/messages";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  let messages: MessageView[];
  try {
    messages = (await listMessages()).map((m) => ({
      id: m.Id,
      kind: m.Kind === "consult" ? "consult" : "contact",
      phone: m.Phone,
      organization: m.Organization,
      consultType: m.ConsultType,
      name: m.Name,
      email: m.Email,
      subject: m.Subject,
      message: m.Message,
      locale: m.Locale,
      isRead: Boolean(m.IsRead),
      createdAt: new Date(m.CreatedAt).toISOString(),
    }));
  } catch (error) {
    return (
      <>
        <PageHeader title="Messages" />
        <DbError error={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description="Messages sent through the contact form on the website. Opening a message marks it as read."
      />
      <MessagesList messages={messages} />
    </>
  );
}
