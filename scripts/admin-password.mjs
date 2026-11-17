#!/usr/bin/env node
/**
 * Creates an admin user or resets its password, directly in the AdminUsers table.
 * Use it when the password is forgotten (the admin panel can change it otherwise).
 *
 *   npm run admin:password -- <username>
 *
 * Reads MSSQL_CONNECTION_STRING from .env.local / .env if set.
 * Passwords are stored in the ASP.NET Identity v3 format the old site also uses.
 */
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import sql from "mssql/msnodesqlv8.js";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const connectionString =
  process.env.MSSQL_CONNECTION_STRING ||
  "Driver={ODBC Driver 17 for SQL Server};Server=lpc:(local);Database=PortfolioDb;Trusted_Connection=Yes;";

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

const pool = await sql.connect({ connectionString });
const result = await pool
  .request()
  .input("u", sql.NVarChar(200), username)
  .input("h", sql.NVarChar(sql.MAX), hash(password))
  .query(`
    UPDATE dbo.AdminUsers SET PasswordHash = @h WHERE Username = @u;
    IF @@ROWCOUNT = 0 INSERT INTO dbo.AdminUsers (Username, PasswordHash) VALUES (@u, @h);
    SELECT @@ROWCOUNT AS changed;
  `);
await pool.close();
console.log(result.rowsAffected[0] ? `Password updated for "${username}".` : `Admin user "${username}" created.`);
