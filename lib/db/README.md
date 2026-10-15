# Database configuration

The application has separate PostgreSQL and MySQL schemas and selects one at
startup. PostgreSQL remains the default. No startup schema creation, migration,
data copying, or fallback to a different engine is performed.

## Settings

| Variable | Meaning |
| --- | --- |
| `DB_DIALECT` | `postgresql` (default; `postgres` alias accepted) or `mysql` |
| `DB_CONNECTION_URL` | Secure URL for the selected engine; takes precedence over individual settings |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Individual connection settings when no custom URL is set |
| `DB_POOL_SIZE` | Connection pool size, default 10, permitted range 1–100 |
| `DB_SSL` | `true`: verified TLS; `false`: explicitly disabled for local development; unset: use driver/URL settings |

Without custom settings, PostgreSQL uses the existing runtime-managed
`DATABASE_URL`. MySQL deliberately does not use that PostgreSQL URL. Configure
MySQL using `DB_CONNECTION_URL` or all the individual settings. The selected
engine and URL protocol must agree; invalid configuration fails explicitly.

Use Replit Secrets for connection URLs, database passwords and other credentials.
The committed `.env.example` is a template, not a credential file. Outside
Replit a local, Git-ignored `.env` can be used. Restart the API after changing
settings. Hosted environment variables take precedence over a local file.

## MySQL requirements and schema preparation

Use **MySQL 8.0.16 or newer** (not MariaDB), InnoDB, strict SQL mode and a
database with `utf8mb4` character encoding. JSON expression defaults and enforced
CHECK constraints require this version. Connections and database timestamps use
UTC. TLS is recommended for remote connections.

Unrestricted CMS text fields remain unrestricted text on MySQL. Its catalog
location/degree index is intentionally omitted rather than truncating those
fields to an indexed VARCHAR; the kind/status and relationship indexes remain.

For an owner-managed MySQL database, review a generated migration before applying
it. From the workspace, with the target securely configured:

```sh
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run migrate
```

The CLI selects the correct schema by `DB_DIALECT`. MySQL migration history lives
in `drizzle/mysql`; existing PostgreSQL migrations remain in `drizzle`. Never
mix migration histories. Do not run a schema push against an existing target
containing data without reviewing its changes and taking a backup.

For Replit-managed PostgreSQL, keep the existing development-schema and Publish
workflow; do not run custom production migrations.

## Switching is not migrating

Changing the dialect selects a different connection/schema only. It does not
transfer content, leads, admins, password hashes, sessions or IDs. Before a live
switch, prepare the target schema and perform a separately approved, backed-up
data migration with ID/relationship, JSON, Unicode and timestamp verification.
Keep the old database until the migrated target is verified.

The existing PostgreSQL data is not changed by adding this configuration.

## Verification

The API startup log reports `dbDialect` without printing connection credentials.
Pure configuration and SQL-generation checks: `pnpm --filter @workspace/db test`.

Only on a development/test database, the opt-in commands below insert and clean
up uniquely named synthetic fixtures. Do not run them against a live production
database. The API check mocks Microsoft Graph, so it sends no real email.

```sh
pnpm --filter @workspace/db run test:integration
pnpm --filter @workspace/api-server run test:database
```
