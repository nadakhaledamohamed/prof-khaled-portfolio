import { db, sql } from "./db";

export interface MessageRow {
  Id: number;
  Name: string;
  Email: string;
  Subject: string;
  Message: string;
  Locale: string | null;
  IsRead: boolean;
  CreatedAt: Date;
}

export async function saveMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale?: string;
}) {
  const pool = await db();
  await pool
    .request()
    .input("name", sql.NVarChar(100), input.name)
    .input("email", sql.NVarChar(150), input.email)
    .input("subject", sql.NVarChar(150), input.subject)
    .input("message", sql.NVarChar(sql.MAX), input.message)
    .input("locale", sql.NVarChar(5), input.locale ?? null)
    .query(
      "INSERT INTO dbo.WebMessages (Name, Email, Subject, Message, Locale) VALUES (@name, @email, @subject, @message, @locale)",
    );
}

export async function listMessages() {
  const pool = await db();
  const result = await pool
    .request()
    .query<MessageRow>(
      "SELECT Id, Name, Email, Subject, Message, Locale, IsRead, CreatedAt FROM dbo.WebMessages ORDER BY CreatedAt DESC",
    );
  return result.recordset;
}

export async function countUnreadMessages() {
  const pool = await db();
  const result = await pool
    .request()
    .query<{ n: number }>("SELECT COUNT(*) AS n FROM dbo.WebMessages WHERE IsRead = 0");
  return result.recordset[0]?.n ?? 0;
}

export async function setMessageRead(id: number, read: boolean) {
  const pool = await db();
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("read", sql.Bit, read)
    .query("UPDATE dbo.WebMessages SET IsRead = @read WHERE Id = @id");
}

export async function removeMessage(id: number) {
  const pool = await db();
  await pool.request().input("id", sql.Int, id).query("DELETE FROM dbo.WebMessages WHERE Id = @id");
}
