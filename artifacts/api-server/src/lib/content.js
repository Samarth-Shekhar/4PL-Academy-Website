import { db, contentTable, jsonText, insensitiveLike } from '@workspace/db';
import { eq, ne, isNull, and, asc, desc, or, inArray, sql } from 'drizzle-orm';

export const publicUniversitySlugs = ['vivekananda-global-university', 'ibmr-group-of-institutions', 'sushant-university'];

// Apply the owner's institution scope consistently to every public read.
// Archived content and historical leads remain accessible to staff.
export function publicUniversityScope() {
  const institutions = db.select({ id: contentTable.id }).from(contentTable).where(and(
    eq(contentTable.kind, 'universities'),
    eq(contentTable.status, 'published'),
    inArray(contentTable.slug, publicUniversitySlugs),
  ));
  return and(
    or(ne(contentTable.kind, 'universities'), inArray(contentTable.slug, publicUniversitySlugs)),
    or(isNull(contentTable.universityId), inArray(contentTable.universityId, institutions)),
  );
}

export const kinds = ['universities', 'programs', 'courses', 'blogs', 'faqs', 'pages', 'media', 'seo', 'settings', 'homepage', 'industry_companies', 'certifications', 'testimonials'];
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
  if (kind === 'media' && status === 'published' && data.type === 'video' && !data.posterUrl) {
    throw Object.assign(new Error('Published videos need an approved poster image for mobile and reduced-motion visitors.'), {status:400});
  }
  const localPath = value => /^\/(?![\/\\])[^\\\u0000-\u001f]*$/.test(value);
  for (const key of ['image','heroImage','logo','websiteUrl','applicationUrl','brochureUrl','supplementaryBrochureUrl','catalogueUrl','canonical','ogImage','url','posterUrl','thumbnailUrl']) {
    const value = data[key];
    if (!value) continue;
    if (['image','heroImage','logo','ogImage','url','posterUrl','thumbnailUrl'].includes(key) && localPath(value)) continue;
    if (['brochureUrl','supplementaryBrochureUrl','catalogueUrl'].includes(key) && localPath(value) && /^\/brochures\/[a-z0-9-]+\.pdf$/.test(value)) continue;
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    } catch {
      throw Object.assign(new Error(`${key} must be a safe http(s) URL or an approved local image path.`), { status: 400 });
    }
  }
  for (const key of ['ctaUrl','secondaryCtaUrl']) {
    const value = data[key];
    if (!value || ['bot',''].includes(value)) continue;
    if (localPath(value)) continue;
    try { const url = new URL(value); if (!['https:','http:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { throw Object.assign(new Error('CTA links must be safe http(s) URLs or local routes.'), {status:400}); }
  }
  for (const item of data.items || []) {
    for (const value of [item.image, item.url === 'bot' ? '' : item.url].filter(Boolean)) {
      if (localPath(value)) continue;
      try { const url = new URL(value); if (!['https:','http:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
      catch { throw Object.assign(new Error('Story media and links must be safe http(s) URLs or local routes.'), {status:400}); }
    }
  }
  for (const value of data.media || []) {
    if (localPath(value)) continue;
    try { const url=new URL(value); if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error(); }
    catch {throw Object.assign(new Error('Media links must be safe http(s) URLs or local asset paths.'),{status:400});}
  }
  return { kind, name: name.trim(), slug, status, featured, sortOrder, universityId, location, degree, category, verified, data, updatedAt: new Date() };
}
export async function getCatalog(kind, filters = {}, admin = false) {
  checkKind(kind);
  const conditions = [eq(contentTable.kind, kind)];
  if (!admin) conditions.push(eq(contentTable.status, 'published'), publicUniversityScope());
  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(or(
      insensitiveLike(contentTable.name, pattern), insensitiveLike(contentTable.location, pattern), insensitiveLike(contentTable.degree, pattern),
      insensitiveLike(jsonText(contentTable.data, 'specialization'), pattern),
      insensitiveLike(jsonText(contentTable.data, 'state'), pattern),
      sql`exists (select 1 from academy_content as university
        where university.id = ${contentTable.universityId}
        and university.kind = 'universities' and university.status = 'published'
        and lower(university.name) like lower(${pattern}))`,
    ));
  }
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
