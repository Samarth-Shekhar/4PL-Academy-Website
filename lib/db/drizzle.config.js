import { defineConfig } from 'drizzle-kit';
import { databaseConfig as config } from './src/config.js';
export default defineConfig({
  schema: config.dialect === 'mysql' ? './src/mysql/index.js' : './src/schema/index.js',
  out: config.dialect === 'mysql' ? '../../drizzle/mysql' : '../../drizzle',
  dialect: config.dialect,
  dbCredentials: { ...(config.url ? { url: config.url } : config.connection), ...(config.ssl !== undefined ? { ssl: config.ssl } : {}) },
});
