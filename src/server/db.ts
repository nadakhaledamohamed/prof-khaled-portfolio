import sql from "mssql/msnodesqlv8";

/**
 * SQL Server access (PortfolioDb) through the ODBC driver, so Windows authentication and
 * local shared-memory connections work without enabling TCP on the server.
 * Override with MSSQL_CONNECTION_STRING (any ODBC connection string).
 */
const DEFAULT_CONNECTION =
  "Driver={ODBC Driver 17 for SQL Server};Server=lpc:(local);Database=PortfolioDb;Trusted_Connection=Yes;";

type GlobalWithDb = typeof globalThis & {
  __kmPool?: Promise<sql.ConnectionPool>;
  __kmSchema?: Promise<void>;
};
const g = globalThis as GlobalWithDb;

export { sql };

export function getPool(): Promise<sql.ConnectionPool> {
  if (!g.__kmPool) {
    const config = {
      connectionString: process.env.MSSQL_CONNECTION_STRING || DEFAULT_CONNECTION,
      connectionTimeout: 30000,
      requestTimeout: 60000,
      // Keep one connection open so requests don't pay for a fresh login each time.
      pool: { max: 5, min: 1, idleTimeoutMillis: 300000 },
    } as unknown as sql.config;

    g.__kmPool = new sql.ConnectionPool(config).connect().catch((error: unknown) => {
      // Allow a later request to retry instead of caching the failure forever.
      g.__kmPool = undefined;
      throw error;
    });
  }
  return g.__kmPool;
}

/**
 * Creates the tables the new site needs, if missing. The original ASP.NET tables
 * (AdminUsers, Books, Profiles, …) are read but never altered.
 */
export function ensureSchema(): Promise<void> {
  if (!g.__kmSchema) {
    g.__kmSchema = (async () => {
      const pool = await getPool();
      await pool.request().batch(`
        IF OBJECT_ID(N'dbo.WebContent', N'U') IS NULL
          CREATE TABLE dbo.WebContent (
            Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebContent PRIMARY KEY,
            Json NVARCHAR(MAX) NOT NULL,
            UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebContent_UpdatedAt DEFAULT SYSUTCDATETIME(),
            UpdatedBy NVARCHAR(100) NULL
          );

        IF OBJECT_ID(N'dbo.WebMedia', N'U') IS NULL
          CREATE TABLE dbo.WebMedia (
            Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_WebMedia PRIMARY KEY,
            StoredName NVARCHAR(100) NOT NULL CONSTRAINT UQ_WebMedia_StoredName UNIQUE,
            OriginalName NVARCHAR(260) NOT NULL,
            ContentType NVARCHAR(100) NOT NULL,
            Size BIGINT NOT NULL,
            CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebMedia_CreatedAt DEFAULT SYSUTCDATETIME()
          );

        IF OBJECT_ID(N'dbo.WebMessages', N'U') IS NULL
          CREATE TABLE dbo.WebMessages (
            Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_WebMessages PRIMARY KEY,
            Name NVARCHAR(100) NOT NULL,
            Email NVARCHAR(150) NOT NULL,
            Subject NVARCHAR(150) NOT NULL,
            Message NVARCHAR(MAX) NOT NULL,
            Locale NVARCHAR(5) NULL,
            IsRead BIT NOT NULL CONSTRAINT DF_WebMessages_IsRead DEFAULT 0,
            CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebMessages_CreatedAt DEFAULT SYSUTCDATETIME()
          );
      `);
    })().catch((error: unknown) => {
      g.__kmSchema = undefined;
      throw error;
    });
  }
  return g.__kmSchema;
}

/** Pool with the schema guaranteed to exist. */
export async function db() {
  await ensureSchema();
  return getPool();
}
