import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Postgres (Neon) over HTTP: no connection pool to manage, works in serverless functions.
 * The Vercel Neon integration sets DATABASE_URL; POSTGRES_URL is accepted too.
 */
type Sql = NeonQueryFunction<false, false>;

type GlobalWithDb = typeof globalThis & {
  __kmSql?: Sql;
  __kmSchema?: Promise<void>;
};
const g = globalThis as GlobalWithDb;

export function sql(): Sql {
  if (!g.__kmSql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL is not set.");
    g.__kmSql = neon(url);
  }
  return g.__kmSql;
}

/** Creates the tables the site needs, if missing. Runs once per server instance. */
export function ensureSchema(): Promise<void> {
  if (!g.__kmSchema) {
    g.__kmSchema = (async () => {
      const q = sql();
      await q.transaction([
        q`CREATE TABLE IF NOT EXISTS web_content (
            id text PRIMARY KEY,
            json jsonb NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now(),
            updated_by text
          )`,
        q`CREATE TABLE IF NOT EXISTS web_media (
            id serial PRIMARY KEY,
            url text NOT NULL UNIQUE,
            pathname text NOT NULL,
            original_name text NOT NULL,
            content_type text NOT NULL,
            size bigint NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
          )`,
        q`CREATE TABLE IF NOT EXISTS web_messages (
            id serial PRIMARY KEY,
            name text NOT NULL,
            email text NOT NULL,
            subject text NOT NULL,
            message text NOT NULL,
            locale text,
            is_read boolean NOT NULL DEFAULT false,
            created_at timestamptz NOT NULL DEFAULT now()
          )`,
        q`CREATE TABLE IF NOT EXISTS admin_users (
            id serial PRIMARY KEY,
            username text NOT NULL UNIQUE,
            password_hash text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
          )`,
      ]);
    })().catch((error: unknown) => {
      g.__kmSchema = undefined;
      throw error;
    });
  }
  return g.__kmSchema;
}

/** Query function with the schema guaranteed to exist. */
export async function db(): Promise<Sql> {
  await ensureSchema();
  return sql();
}
