import { db, sql } from "./db";

export interface MessageRow {
  Id: number;
  Kind: "contact" | "consult";
  Name: string;
  Email: string;
  Phone: string | null;
  Organization: string | null;
  ConsultType: string | null;
  Subject: string;
  Message: string;
  Locale: string | null;
  IsRead: boolean;
  CreatedAt: Date | string;
}

type GlobalWithMessages = typeof globalThis & { __kmMessageCols?: Promise<void> };
const g = globalThis as GlobalWithMessages;

/** Adds the consultation columns to tables created before they existed (runs once per instance). */
async function q() {
  const query = await db();
  if (!g.__kmMessageCols) {
    g.__kmMessageCols = (async () => {
      const s = sql();
      await s.transaction([
        s`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'contact'`,
        s`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS phone text`,
        s`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS organization text`,
        s`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS consult_type text`,
      ]);
    })().catch((error: unknown) => {
      g.__kmMessageCols = undefined;
      throw error;
    });
  }
  await g.__kmMessageCols;
  return query;
}

export async function saveMessage(input: {
  kind?: "contact" | "consult";
  name: string;
  email: string;
  subject: string;
  message: string;
  locale?: string;
  phone?: string;
  organization?: string;
  consultType?: string;
  createdAt?: string;
}) {
  const query = await q();
  await query`
    INSERT INTO web_messages (kind, name, email, phone, organization, consult_type, subject, message, locale, created_at)
    VALUES (
      ${input.kind ?? "contact"}, ${input.name}, ${input.email}, ${input.phone || null}, ${input.organization || null},
      ${input.consultType || null}, ${input.subject}, ${input.message}, ${input.locale ?? null},
      ${input.createdAt ?? new Date().toISOString()}
    )
  `;
}

export async function listMessages(): Promise<MessageRow[]> {
  const query = await q();
  return (await query`
    SELECT id AS "Id", kind AS "Kind", name AS "Name", email AS "Email", phone AS "Phone",
           organization AS "Organization", consult_type AS "ConsultType", subject AS "Subject",
           message AS "Message", locale AS "Locale", is_read AS "IsRead", created_at AS "CreatedAt"
    FROM web_messages ORDER BY created_at DESC
  `) as MessageRow[];
}

export async function countUnreadMessages(): Promise<number> {
  const query = await q();
  const rows = (await query`SELECT count(*)::int AS n FROM web_messages WHERE NOT is_read`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function setMessageRead(id: number, read: boolean) {
  const query = await q();
  await query`UPDATE web_messages SET is_read = ${read} WHERE id = ${id}`;
}

export async function removeMessage(id: number) {
  const query = await q();
  await query`DELETE FROM web_messages WHERE id = ${id}`;
}
