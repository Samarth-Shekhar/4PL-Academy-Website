import { existsSync } from 'node:fs';
import path from 'node:path';
for (const candidate of [path.resolve('.env'),path.resolve('../../.env')]) {
  if (existsSync(candidate)) { process.loadEnvFile(candidate); break; }
}
export const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
export const cookieSecure = process.env.NODE_ENV === 'production' || Boolean(process.env.REPL_ID);
