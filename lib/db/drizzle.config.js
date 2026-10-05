import { defineConfig } from 'drizzle-kit';
import { existsSync } from 'node:fs';
if (existsSync('../../.env')) process.loadEnvFile('../../.env');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be configured.');
export default defineConfig({
  schema: './src/schema/index.js',
  out: '../../drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
});
