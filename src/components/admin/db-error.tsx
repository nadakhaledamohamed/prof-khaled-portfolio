import { DatabaseZap } from "lucide-react";

/** Shown in place of an editor when the database cannot be read, so nothing is edited blind. */
export function DbError({ error }: { error: unknown }) {
  const detail = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="glass flex flex-col items-start gap-3 rounded-3xl p-6 sm:p-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <DatabaseZap className="size-5" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold">The database is not reachable</h2>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        Make sure SQL Server is running and that <code className="font-mono">MSSQL_CONNECTION_STRING</code>{" "}
        in <code className="font-mono">.env.local</code> points at PortfolioDb. Then reload this page.
      </p>
      <p className="max-w-xl break-words font-mono text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
