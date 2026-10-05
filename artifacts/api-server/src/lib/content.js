import { db, contentTable } from '@workspace/db';
import { eq, and, asc, desc, ilike, or, inArray, sql } from 'drizzle-orm';

export const kinds = ['universities', 'programs', 'courses', 'blogs', 'faqs', 'pages', 'media', 'seo', 'settings'];
export function checkKind(kind) {
  if (!kinds.includes(kind)) throw Object.assign(new Error('Content type not found.'), { status: 404 });
  return kind;
}
export function publicContent(row, privateFields = false) {
  const { data, ...fields } = row;
  const result = { ...data, ...fields, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
  if (!privateFields) {
    delete result.couponCode;
    delete result.verificationNotes;
  }
  return result;
}
export function contentValues(input, kind) {
  const { id: _id, kind: _kind, createdAt: _createdAt, updatedAt: _updatedAt, universityName: _universityName, name, slug, status = 'draft', featured = false, sortOrder = 0, universityId = null, location = '', degree = '', category = '', verified = false, ...data } = input;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw Object.assign(new Error('Use a lowercase hyphen-separated URL slug.'), { status: 400 });
  for (const key of ['image','logo','websiteUrl','applicationUrl','brochureUrl','canonical','ogImage']) {
    const value = data[key];
    if (!value) continue;
    if (['image','logo','ogImage'].includes(key) && /^\/(?!\/)/.test(value)) continue;
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    } catch {
      throw Object.assign(new Error(`${key} must be a safe http(s) URL or an approved local image path.`), { status: 400 });
    }
  }
  for (const value of data.media || []) {
    if (/^\/(?!\/)/.test(value)) continue;
    try { const url=new URL(value); if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error(); }
    catch {throw Object.assign(new Error('Media links must be safe http(s) URLs or local asset paths.'),{status:400});}
  }
  return { kind, name: name.trim(), slug, status, featured, sortOrder, universityId, location, degree, category, verified, data, updatedAt: new Date() };
}
export async function getCatalog(kind, filters = {}, admin = false) {
  checkKind(kind);
  const conditions = [eq(contentTable.kind, kind)];
  if (!admin) conditions.push(eq(contentTable.status, 'published'));
  if (filters.search) conditions.push(or(ilike(contentTable.name, `%${filters.search}%`), ilike(contentTable.location, `%${filters.search}%`), ilike(contentTable.degree, `%${filters.search}%`),sql`${contentTable.data}->>'specialization' ilike ${'%'+filters.search+'%'}`,sql`${contentTable.data}->>'state' ilike ${'%'+filters.search+'%'}`));
  if (filters.location) conditions.push(eq(contentTable.location, filters.location));
  if (filters.degree && kind === 'universities') {
    const linked=await db.select({id:contentTable.universityId}).from(contentTable).where(and(eq(contentTable.kind,'programs'),eq(contentTable.status,'published'),eq(contentTable.degree,filters.degree)));
    const ids=linked.map(p=>p.id).filter(Boolean);
    if(!ids.length)return [];
    conditions.push(inArray(contentTable.id,ids));
  } else if(filters.degree) conditions.push(eq(contentTable.degree, filters.degree));
  if (filters.category) conditions.push(eq(contentTable.category, filters.category));
  if (filters.universityId) conditions.push(eq(contentTable.universityId, Number(filters.universityId)));
  if (filters.featured === 'true') conditions.push(eq(contentTable.featured, true));
  const order = filters.sort === 'name-desc' ? desc(contentTable.name) : filters.sort === 'name' || filters.sort === 'name-asc' ? asc(contentTable.name) : asc(contentTable.sortOrder);
  const rows = await db.select().from(contentTable).where(and(...conditions)).orderBy(order, asc(contentTable.id)).limit(1000);
  const universities = await db.select({ id: contentTable.id, name: contentTable.name }).from(contentTable).where(eq(contentTable.kind, 'universities'));
  const names = new Map(universities.map(u => [u.id, u.name]));
  return rows.map(row => ({ ...publicContent(row, admin), ...(row.universityId ? { universityName: names.get(row.universityId) || '' } : {}) }));
}
