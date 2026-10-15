import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readDatabaseConfig } from './settings.js';

// Application startup may load an owner's local file; never log its contents.
for (const candidate of [
  path.resolve('.env'),
  path.resolve('../../.env'),
  fileURLToPath(new URL('../../../.env', import.meta.url)),
]) {
  if (existsSync(candidate)) { process.loadEnvFile(candidate); break; }
}
export const databaseConfig = readDatabaseConfig(process.env);
export const dialect = databaseConfig.dialect;
