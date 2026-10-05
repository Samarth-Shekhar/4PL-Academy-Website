import { pgTable, serial, text, boolean, integer, jsonb, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const contentTable = pgTable('academy_content', {
  id: serial('id').primaryKey(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  status: text('status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  universityId: integer('university_id').references(() => contentTable.id, { onDelete: 'restrict' }),
  location: text('location').notNull().default(''),
  degree: text('degree').notNull().default(''),
  category: text('category').notNull().default(''),
  verified: boolean('verified').notNull().default(false),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('academy_content_kind_slug_idx').on(t.kind, t.slug),
  index('academy_content_status_featured_idx').on(t.kind, t.status, t.featured),
  index('academy_content_university_idx').on(t.universityId),
  index('academy_content_location_degree_idx').on(t.location, t.degree),
  check('academy_content_kind_check', sql`${t.kind} in ('universities','programs','courses','blogs','faqs','pages','media','seo','settings','homepage','industry_companies','certifications','testimonials')`),
  check('academy_content_status_check', sql`${t.status} in ('published','draft','archived')`),
]);
