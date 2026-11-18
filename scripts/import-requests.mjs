#!/usr/bin/env node
/**
 * Loads the consultation requests exported from the previous site
 * (scripts/legacy-consult-requests.json, written by import-legacy.mjs and never committed)
 * into the admin inbox. Safe to re-run: requests already present are skipped.
 *
 *   npm run import:requests
 *
 * Reads DATABASE_URL from .env.local / .env (run `vercel env pull .env.local` first).
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}
const source = "scripts/legacy-consult-requests.json";
if (!existsSync(source)) {
  console.error(`${source} not found. Run scripts/import-legacy.mjs first.`);
  process.exit(1);
}

const sql = neon(url);
await sql`CREATE TABLE IF NOT EXISTS web_messages (
  id serial PRIMARY KEY, name text NOT NULL, email text NOT NULL, subject text NOT NULL, message text NOT NULL,
  locale text, is_read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
)`;
await sql`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'contact'`;
await sql`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS phone text`;
await sql`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS organization text`;
await sql`ALTER TABLE web_messages ADD COLUMN IF NOT EXISTS consult_type text`;

let added = 0;
for (const r of JSON.parse(readFileSync(source, "utf8"))) {
  const rows = await sql`
    INSERT INTO web_messages (kind, name, email, phone, organization, consult_type, subject, message, locale, created_at)
    SELECT 'consult', ${r.name}, ${r.email}, ${r.phone || null}, ${r.organization || null}, ${r.consultType || null},
           ${r.subject || "—"}, ${r.message || "—"}, 'ar', ${r.createdAt}
    WHERE NOT EXISTS (SELECT 1 FROM web_messages WHERE email = ${r.email} AND created_at = ${r.createdAt})
    RETURNING id
  `;
  added += rows.length;
}
console.log(`Consultation requests added to the inbox: ${added}`);
