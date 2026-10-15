import { mysqlTable, int, varchar, text, longtext, boolean, json, datetime, index, uniqueIndex, check, foreignKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const contentTable = mysqlTable('academy_content', {
  id: int('id').autoincrement().primaryKey(),
  kind: varchar('kind', { length: 32 }).notNull(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  sortOrder: int('sort_order').notNull().default(0),
  universityId: int('university_id'),
  location: longtext('location').notNull().default(sql`('')`),
  degree: longtext('degree').notNull().default(sql`('')`),
  category: longtext('category').notNull().default(sql`('')`),
  verified: boolean('verified').notNull().default(false),
  data: json('data').notNull().default(sql`(JSON_OBJECT())`),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  uniqueIndex('academy_content_kind_slug_idx').on(t.kind, t.slug),
  index('academy_content_status_featured_idx').on(t.kind, t.status, t.featured),
  index('academy_content_university_idx').on(t.universityId),
  // MySQL cannot fully index unrestricted text. Preserve CMS values rather
  // than silently narrowing PostgreSQL text fields to VARCHAR(255).
  foreignKey({ columns: [t.universityId], foreignColumns: [t.id], name: 'academy_content_university_fk' }).onDelete('restrict'),
  check('academy_content_kind_check', sql`${t.kind} in ('universities','programs','courses','blogs','faqs','pages','media','seo','settings','homepage','industry_companies','certifications','testimonials')`),
  check('academy_content_status_check', sql`${t.status} in ('published','draft','archived')`),
]);
