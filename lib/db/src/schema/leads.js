import { pgTable, serial, text, integer, boolean, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { contentTable } from './content.js';

export const leadsTable = pgTable('academy_leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  consent: boolean('consent').notNull(),
  category: text('category').notNull().default('contact'),
  university: text('university').notNull().default(''),
  program: text('program').notNull().default(''),
  course: text('course').notNull().default(''),
  contentId: integer('content_id').references(() => contentTable.id, { onDelete: 'set null' }),
  source: text('source').notNull().default('website'),
  utm: text('utm').notNull().default(''),
  message: text('message').notNull().default(''),
  status: text('status').notNull().default('New'),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('academy_leads_status_idx').on(t.status),
  index('academy_leads_category_date_idx').on(t.category, t.createdAt),
  check('academy_leads_status_check', sql`${t.status} in ('New','Contacted','Interested','Application Started','Applied','Admission Confirmed','Closed')`),
]);
