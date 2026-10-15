import { mkdir, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import mysql from 'mysql2/promise';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { getTableColumns } from 'drizzle-orm';
import * as mysqlSchema from '../mysql/index.js';
import { pool, dialect } from '../index.js';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const tables = ['academy_content', 'academy_admins', 'academy_sessions', 'academy_leads'];
const mysqlTables = Object.fromEntries(Object.values(mysqlSchema).map((table) => [
  table[Symbol.for('drizzle:Name')], table,
]));
const fail = (message) => {
  const error = new Error(message);
  error.backupSafe = true;
  throw error;
};
const identifier = (value, quote = '"') => {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) fail('Unexpected database identifier.');
  return `${quote}${value}${quote}`;
};
const hexString = (value) => `CONVERT(X'${Buffer.from(value, 'utf8').toString('hex')}' USING utf8mb4)`;
const literal = (value, type) => {
  if (value === null) return 'NULL';
  if (type === 'jsonb') return `CAST(${hexString(value)} AS JSON)`;
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) fail('A numeric value cannot be exported losslessly.');
    return String(value);
  }
  return hexString(value);
};
const selectColumns = (columns, engine) => columns.map((column) => {
  const name = identifier(column.column_name, engine === 'mysql' ? '`' : '"');
  if (column.udt_name === 'timestamptz') {
    return engine === 'mysql'
      ? `DATE_FORMAT(${name}, '%Y-%m-%d %H:%i:%s.%f') AS ${name}`
      : `to_char(${name} AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') AS ${name}`;
  }
  if (column.udt_name === 'jsonb') return engine === 'mysql' ? `CAST(${name} AS CHAR) AS ${name}` : `${name}::text AS ${name}`;
  return name;
}).join(', ');

let source;
let target;
try {
  if (dialect !== 'postgresql') fail('This exporter requires the existing PostgreSQL source; no database was changed.');
  source = await pool.connect();
  await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const snapshotTime = (await source.query('SELECT CURRENT_TIMESTAMP AS time')).rows[0].time.toISOString();
  const actualTables = (await source.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).rows.map((row) => row.tablename);
  if (actualTables.some((name) => !tables.includes(name))) fail('Unmapped public tables exist; refusing an incomplete database export.');
  const snapshots = [];
  for (const table of tables) {
    const columns = (await source.query(
      'SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position',
      ['public', table],
    )).rows;
    if (!columns.length) fail(`Missing source table: ${table}.`);
    const key = table === 'academy_sessions' ? 'token_hash' : 'id';
    const rows = (await source.query(`SELECT ${selectColumns(columns, 'postgresql')} FROM public.${identifier(table)} ORDER BY ${identifier(key)}`)).rows;
    const targetColumns = Object.fromEntries(Object.values(getTableColumns(mysqlTables[table])).map((column) => [column.name, column]));
    for (const column of columns) {
      if (!targetColumns[column.column_name]) fail(`Unmapped column in ${table}.`);
      const type = targetColumns[column.column_name].getSQLType();
      const varchar = /^varchar\((\d+)\)$/.exec(type);
      for (const row of rows) {
        const value = row[column.column_name];
        if (value === null || typeof value !== 'string') continue;
        if (varchar && [...value].length > Number(varchar[1])) fail(`A ${table}.${column.column_name} value exceeds the MySQL column limit.`);
        if (type === 'text' && Buffer.byteLength(value, 'utf8') > 65535) fail(`A ${table}.${column.column_name} value exceeds the MySQL TEXT limit.`);
      }
    }
    let nextId;
    if (key === 'id') {
      const sequence = (await source.query("SELECT pg_get_serial_sequence($1, 'id') AS name", [`public.${table}`])).rows[0].name;
      const quotedSequence = sequence.split('.').map((part) => identifier(part)).join('.');
      const sequenceState = (await source.query(`SELECT last_value, is_called FROM ${quotedSequence}`)).rows[0];
      nextId = Math.max(Number(sequenceState.last_value) + (sequenceState.is_called ? 1 : 0), ...rows.map((row) => row.id + 1), 1);
    }
    snapshots.push({ table, key, columns, rows, nextId });
  }
  const historyExists = (await source.query("SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS present")).rows[0].present;
  const sourceHistory = historyExists
    ? (await source.query('SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id')).rows
    : [];
  const migrations = readMigrationFiles({ migrationsFolder: join(root, 'drizzle/mysql') });
  const statements = [
    'SET @BACKUP_OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS',
    'SET @BACKUP_OLD_TIME_ZONE = @@time_zone',
    'SET @BACKUP_OLD_SQL_MODE = @@sql_mode',
    "SET NAMES utf8mb4 COLLATE utf8mb4_0900_bin",
    "SET time_zone = '+00:00'",
    "SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE'",
    'SET FOREIGN_KEY_CHECKS = 0',
  ];
  for (const migration of migrations) {
    for (let statement of migration.sql) {
      statement = statement.trim().replace(/;$/, '');
      if (!statement) continue;
      // Preserve PostgreSQL timestamp microseconds, not just JavaScript milliseconds.
      statement = statement.replace(/datetime\(3\)/gi, 'datetime(6)').replace(/CURRENT_TIMESTAMP\(3\)/gi, 'CURRENT_TIMESTAMP(6)');
      if (/^CREATE TABLE /i.test(statement)) {
        statement = statement.replace(/\)$/, ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin');
      }
      statements.push(statement);
    }
  }
  statements.push('CREATE TABLE `__drizzle_migrations` (`id` SERIAL PRIMARY KEY, `hash` TEXT NOT NULL, `created_at` BIGINT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
  statements.push('START TRANSACTION');
  for (const snapshot of snapshots) {
    const names = snapshot.columns.map((column) => identifier(column.column_name, '`')).join(', ');
    for (const row of snapshot.rows) {
      const values = snapshot.columns.map((column) => literal(row[column.column_name], column.udt_name)).join(', ');
      statements.push(`INSERT INTO ${identifier(snapshot.table, '`')} (${names}) VALUES (${values})`);
    }
  }
  for (const migration of migrations) statements.push(`INSERT INTO \`__drizzle_migrations\` (\`hash\`, \`created_at\`) VALUES (${hexString(migration.hash)}, ${migration.folderMillis})`);
  statements.push('COMMIT');
  for (const snapshot of snapshots) {
    if (snapshot.nextId) statements.push(`ALTER TABLE ${identifier(snapshot.table, '`')} AUTO_INCREMENT = ${snapshot.nextId}`);
  }
  statements.push('SET FOREIGN_KEY_CHECKS = @BACKUP_OLD_FOREIGN_KEY_CHECKS', 'SET time_zone = @BACKUP_OLD_TIME_ZONE', 'SET sql_mode = @BACKUP_OLD_SQL_MODE');
  const sql = `-- 4PL Academy PostgreSQL-to-MySQL backup\n-- Snapshot: ${snapshotTime}\n-- Import ONLY into an empty MySQL 8.0.17+ database (8.4 recommended).\n-- Contains private leads, administrator password hashes and hashed sessions.\n-- No DROP/TRUNCATE or source-database changes. UTC timestamps retain microseconds.\n\n${statements.join(';\n\n')};\n`;
  const directory = join(root, 'db_back');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const stem = `academy_mysql_${snapshotTime.replace(/[:.]/g, '-')}`;
  const partial = join(directory, `${stem}.sql.partial`);
  const final = join(directory, `${stem}.sql`);
  await writeFile(partial, sql, { mode: 0o600, flag: 'wx' });
  let verification = 'Not restored; source snapshot and SQL generated successfully.';
  if (process.argv.includes('--verify-local')) {
    // Fixed disposable local target, never the application's configured database.
    target = await mysql.createConnection({ host: '127.0.0.1', port: 33306, user: 'root', database: 'academy_dump_verify', charset: 'utf8mb4', dateStrings: true, jsonStrings: true });
    for (const statement of statements) await target.query(statement);
    for (const snapshot of snapshots) {
      const [rows] = await target.query(`SELECT ${selectColumns(snapshot.columns, 'mysql')} FROM ${identifier(snapshot.table, '`')}`);
      if (rows.length !== snapshot.rows.length) fail(`Restore count mismatch: ${snapshot.table}.`);
      const restored = new Map(rows.map((row) => [String(row[snapshot.key]), row]));
      for (const expected of snapshot.rows) {
        const actual = restored.get(String(expected[snapshot.key]));
        if (!actual) fail(`Restore key mismatch: ${snapshot.table}.`);
        for (const column of snapshot.columns) {
          const a = actual[column.column_name];
          const b = expected[column.column_name];
          if (column.udt_name === 'jsonb') {
            const same = (await source.query('SELECT $1::jsonb = $2::jsonb AS same', [a, b])).rows[0].same;
            if (!same) fail(`Restore JSON mismatch: ${snapshot.table}.${column.column_name}.`);
          } else if (column.udt_name === 'bool' ? Boolean(a) !== b : a !== b) {
            fail(`Restore value mismatch: ${snapshot.table}.${column.column_name}.`);
          }
        }
      }
    }
    verification = 'Restored on isolated MySQL 8.4; every application row and field compared with the read-only source snapshot.';
  }
  await source.query('COMMIT');
  await rename(partial, final);
  const manifest = {
    exportedAt: snapshotTime, sourceDialect: 'postgresql', targetDialect: 'mysql',
    file: `${stem}.sql`, sha256: createHash('sha256').update(sql).digest('hex'),
    tables: snapshots.map(({ table, rows, nextId }) => ({ table, rows: rows.length, ...(nextId ? { nextAutoIncrement: nextId } : {}) })),
    verification, postgresMigrationHistory: sourceHistory,
    note: 'PostgreSQL migration history is archived here, not imported as MySQL history. The SQL records the included MySQL schema migrations. Binary collation preserves case-sensitive unique values; DATETIME(6) preserves source microseconds.',
  };
  await writeFile(join(directory, `${stem}.manifest.json`), JSON.stringify(manifest, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  process.stdout.write(JSON.stringify({ file: `db_back/${stem}.sql`, tables: manifest.tables, verification }, null, 2) + '\n');
} catch (error) {
  if (source) await source.query('ROLLBACK').catch(() => {});
  process.stderr.write(error.backupSafe ? `${error.message}\n` : `Backup failed (${String(error.code || 'database/file error').replace(/[^a-zA-Z0-9_ /]/g, '')}). No source data was changed.\n`);
  process.exitCode = 1;
} finally {
  if (target) await target.end();
  if (source) source.release();
  await pool.end();
}
