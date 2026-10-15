import { drizzle as postgresDrizzle } from 'drizzle-orm/node-postgres';
import { drizzle as mysqlDrizzle } from 'drizzle-orm/mysql2';
import pg from 'pg';
import mysql from 'mysql2/promise';
import * as schema from './schema/runtime.js';
import { databaseConfig, dialect } from './config.js';
import { createRowOperations } from './operations.js';
import { createExpressions } from './expressions.js';

const config = databaseConfig;
export const pool = dialect === 'mysql'
  ? mysql.createPool({
      ...(config.url ? { uri: config.url } : config.connection),
      ...(config.ssl !== undefined ? { ssl: config.ssl } : {}),
      connectionLimit: config.poolSize, charset: 'utf8mb4', timezone: 'Z',
    })
  : new pg.Pool({
      ...(config.url ? { connectionString: config.url } : config.connection),
      ...(config.ssl !== undefined ? { ssl: config.ssl } : {}),
      max: config.poolSize,
    });
if (dialect === 'mysql') pool.on('connection', (connection) => connection.query("SET time_zone = '+00:00'"));
export const db = dialect === 'mysql'
  ? mysqlDrizzle(pool, { schema, mode: 'default' })
  : postgresDrizzle(pool, { schema });
export const { insertRow, updateRow, deleteRow } = createRowOperations(db, dialect);
export const { jsonText, insensitiveLike, mediaReferences } = createExpressions(dialect);
export { dialect };
export { isUniqueViolation } from './operations.js';
export * from './schema/runtime.js';
