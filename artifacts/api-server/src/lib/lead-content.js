import { db, contentTable } from '@workspace/db';
import { and, eq } from 'drizzle-orm';
import { publicUniversityScope } from './content.js';

// Degree titles are not unique across universities. Preserve the submitted
// institution rather than linking to a similarly named degree elsewhere.
export async function resolveLeadContentId(data) {
  const name = data.program || data.course || data.university;
  if (!name) return null;
  const conditions = [eq(contentTable.name, name), eq(contentTable.status, 'published'), publicUniversityScope()];
  if (data.program) {
    conditions.push(eq(contentTable.kind, 'programs'));
    if (data.university) {
      const [university] = await db.select({ id: contentTable.id }).from(contentTable).where(and(eq(contentTable.kind, 'universities'), eq(contentTable.name, data.university), eq(contentTable.status, 'published'), publicUniversityScope())).limit(1);
      conditions.push(eq(contentTable.universityId, university?.id ?? -1));
    }
  } else conditions.push(eq(contentTable.kind, data.course ? 'courses' : 'universities'));
  const [content] = await db.select({ id: contentTable.id }).from(contentTable).where(and(...conditions)).limit(1);
  return content?.id || null;
}
