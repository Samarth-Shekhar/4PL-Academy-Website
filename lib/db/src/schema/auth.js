import { pgTable, serial, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const adminsTable = pgTable('academy_admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const sessionsTable = pgTable('academy_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  adminId: integer('admin_id').notNull().references(() => adminsTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (t) => [index('academy_sessions_expiry_idx').on(t.expiresAt)]);
