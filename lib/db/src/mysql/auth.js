import { mysqlTable, int, varchar, text, datetime, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const adminsTable = mysqlTable('academy_admins', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 32 }).notNull().default('admin'),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
});
export const sessionsTable = mysqlTable('academy_sessions', {
  tokenHash: varchar('token_hash', { length: 64 }).primaryKey(),
  adminId: int('admin_id').notNull().references(() => adminsTable.id, { onDelete: 'cascade' }),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
}, (t) => [index('academy_sessions_expiry_idx').on(t.expiresAt)]);
