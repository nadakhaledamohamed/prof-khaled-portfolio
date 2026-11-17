#!/usr/bin/env node
/**
 * Creates an admin user or resets its password.
 * Use it when the password is forgotten (the admin panel can change it otherwise).
 *
 *   npm run admin:password -- <username>
 *
 * Reads DATABASE_URL from .env.local / .env (run `vercel env pull` to get it).
 * Passwords use the ASP.NET Identity v3 hash format (PBKDF2-SHA512, 100k iterations).
 */
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
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

const username = process.argv[2];
if (!username) {
  console.error("Usage: npm run admin:password -- <username>");
  process.exit(1);
}

function hash(password) {
  const salt = randomBytes(16);
  const subkey = pbkdf2Sync(password, salt, 100_000, 32, "sha512");
  const header = Buffer.alloc(13);
  header[0] = 0x01;
  header.writeUInt32BE(2, 1);
  header.writeUInt32BE(100_000, 5);
  header.writeUInt32BE(16, 9);
  return Buffer.concat([header, salt, subkey]).toString("base64");
}

function askHidden(question) {
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

const password = await askHidden(`New password for "${username}": `);
const confirm = await askHidden("Repeat it: ");
if (password.length < 10) {
  console.error("Use at least 10 characters.");
  process.exit(1);
}
if (password !== confirm) {
  console.error("The passwords do not match.");
  process.exit(1);
}

const sql = neon(url);
await sql`CREATE TABLE IF NOT EXISTS admin_users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)`;
const rows = await sql`
  INSERT INTO admin_users (username, password_hash) VALUES (${username}, ${hash(password)})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING (xmax = 0) AS created
`;
console.log(rows[0]?.created ? `Admin user "${username}" created.` : `Password updated for "${username}".`);
