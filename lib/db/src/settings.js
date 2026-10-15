// Pure configuration parsing: never include connection URLs or passwords in errors.
export function readDatabaseConfig(env) {
  const rawDialect = (env.DB_DIALECT || 'postgresql').trim().toLowerCase();
  const dialect = rawDialect === 'postgres' ? 'postgresql' : rawDialect;
  if (!['postgresql', 'mysql'].includes(dialect)) throw new Error('DB_DIALECT must be postgresql or mysql.');
  const poolSize = Number(env.DB_POOL_SIZE || 10);
  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 100) throw new Error('DB_POOL_SIZE must be between 1 and 100.');
  if (env.DB_SSL && !['true', 'false'].includes(env.DB_SSL)) throw new Error('DB_SSL must be true or false.');
  const ssl = env.DB_SSL === 'true' ? { rejectUnauthorized: true } : env.DB_SSL === 'false' ? false : undefined;
  // Never treat Replit's managed PostgreSQL URL as a MySQL connection.
  const url = env.DB_CONNECTION_URL || (!env.DB_HOST && dialect === 'postgresql' ? env.DATABASE_URL : undefined);
  if (url) {
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error('The selected database connection URL is invalid.'); }
    const protocols = dialect === 'mysql' ? ['mysql:'] : ['postgres:', 'postgresql:'];
    if (!protocols.includes(parsed.protocol)) throw new Error('Database connection URL does not match DB_DIALECT.');
    if (!parsed.hostname || !parsed.pathname.slice(1)) throw new Error('Database connection URL must include a host and database name.');
    return { dialect, poolSize, ssl, url };
  }
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (env[key] === undefined || (key !== 'DB_PASSWORD' && !env[key].trim())) {
      throw new Error(`${key} is required, or configure DB_CONNECTION_URL for the selected database.`);
    }
  }
  const port = Number(env.DB_PORT || (dialect === 'mysql' ? 3306 : 5432));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('DB_PORT must be a valid port number.');
  return {
    dialect, poolSize, ssl,
    connection: { host: env.DB_HOST, port, database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD },
  };
}
