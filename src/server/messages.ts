import { db } from "./db";

export interface MessageRow {
  Id: number;
  Name: string;
  Email: string;
  Subject: string;
  Message: string;
  Locale: string | null;
  IsRead: boolean;
  CreatedAt: Date | string;
}

export async function saveMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale?: string;
}) {
  const q = await db();
  await q`
    INSERT INTO web_messages (name, email, subject, message, locale)
    VALUES (${input.name}, ${input.email}, ${input.subject}, ${input.message}, ${input.locale ?? null})
  `;
}

export async function listMessages(): Promise<MessageRow[]> {
  const q = await db();
  return (await q`
    SELECT id AS "Id", name AS "Name", email AS "Email", subject AS "Subject", message AS "Message",
           locale AS "Locale", is_read AS "IsRead", created_at AS "CreatedAt"
    FROM web_messages ORDER BY created_at DESC
  `) as MessageRow[];
}

export async function countUnreadMessages(): Promise<number> {
  const q = await db();
  const rows = (await q`SELECT count(*)::int AS n FROM web_messages WHERE NOT is_read`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function setMessageRead(id: number, read: boolean) {
  const q = await db();
  await q`UPDATE web_messages SET is_read = ${read} WHERE id = ${id}`;
}

export async function removeMessage(id: number) {
  const q = await db();
  await q`DELETE FROM web_messages WHERE id = ${id}`;
}
