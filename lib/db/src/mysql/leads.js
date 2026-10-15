import { mysqlTable, int, text, longtext, varchar, boolean, datetime, index, check } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { contentTable } from './content.js';

const optionalText = (name) => longtext(name).notNull().default(sql`('')`);
export const leadsTable = mysqlTable('academy_leads', {
  id: int('id').autoincrement().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  phoneCountry: optionalText('phone_country'),
  consent: boolean('consent').notNull(),
  category: varchar('category', { length: 64 }).notNull().default('contact'),
  university: optionalText('university'),
  program: optionalText('program'),
  course: optionalText('course'),
  interestedIn: optionalText('interested_in'),
  qualification: optionalText('qualification'),
  city: optionalText('city'),
  preferredDate: optionalText('preferred_date'),
  preferredTime: optionalText('preferred_time'),
  timeZone: optionalText('time_zone'),
  contentId: int('content_id').references(() => contentTable.id, { onDelete: 'set null' }),
  source: text('source').notNull().default(sql`('website')`),
  utm: optionalText('utm'),
  message: optionalText('message'),
  status: varchar('status', { length: 64 }).notNull().default('New'),
  notes: optionalText('notes'),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  index('academy_leads_status_idx').on(t.status),
  index('academy_leads_category_date_idx').on(t.category, t.createdAt),
  check('academy_leads_status_check', sql`${t.status} in ('New','Contacted','Interested','Application Started','Applied','Admission Confirmed','Closed')`),
]);
