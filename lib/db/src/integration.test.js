// Opt-in integration test. Only synthetic, uniquely named fixtures are touched.
// Run against a prepared database; this script never creates schema or migrates.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { eq, and, sql } from 'drizzle-orm';
import { db, pool, dialect, contentTable, adminsTable, sessionsTable, leadsTable, insertRow, updateRow, deleteRow, jsonText, insensitiveLike, mediaReferences } from './index.js';

const token = `db-test-${randomUUID()}`;
const ids = { content: [], admins: [], leads: [] };
try {
  const data = { description: 'नमस्ते 🤖 café', specialization: token.toUpperCase(), state: token, items: [{ image: token }], media: [token] };
  const longLocation = 'स्थान 🤖 '.repeat(100);
  const content = await insertRow(contentTable, { kind: 'courses', name: token, slug: token, status: 'draft', data, location: longLocation });
  ids.content.push(content.id);
  assert.deepEqual(content.data, data);
  assert.equal(content.location, longLocation);
  assert.equal(content.featured, false);
  assert.ok(content.createdAt instanceof Date);
  assert.equal(await insertRow(contentTable, { kind: 'courses', name: token, slug: token }, { ignoreConflict: true }), undefined);
  const match = await db.select({ id: contentTable.id }).from(contentTable).where(and(
    eq(contentTable.id, content.id),
    insensitiveLike(jsonText(contentTable.data, 'specialization'), token),
    mediaReferences(contentTable.data, token),
  ));
  assert.equal(match.length, 1);
  const modified = await updateRow(contentTable, eq(contentTable.id, content.id), { name: `${token}-updated`, status: 'published', updatedAt: new Date() });
  assert.equal(modified.status, 'published');
  assert.equal(modified.name, `${token}-updated`);
  const lead = await insertRow(leadsTable, { name: token, email: `${token}@example.test`, phone: '+919876543210', consent: true, contentId: content.id, category: 'counselling', preferredDate: '2030-01-02', preferredTime: '14:30', timeZone: 'Asia/Kolkata' });
  ids.leads.push(lead.id);
  assert.equal(lead.consent, true);
  assert.equal(lead.preferredDate, '2030-01-02');
  assert.equal(lead.message, '');
  const admin = await insertRow(adminsTable, { email: `${token}@example.test`, passwordHash: 'synthetic-not-a-login-hash' });
  ids.admins.push(admin.id);
  const expiry = new Date('2030-01-02T03:04:05.123Z');
  await db.insert(sessionsTable).values({ tokenHash: token, adminId: admin.id, expiresAt: expiry });
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.tokenHash, token));
  assert.equal(session.expiresAt.toISOString(), expiry.toISOString());
  await deleteRow(adminsTable, eq(adminsTable.id, admin.id));
  assert.equal((await db.select().from(sessionsTable).where(eq(sessionsTable.tokenHash, token))).length, 0);
  await deleteRow(contentTable, eq(contentTable.id, content.id));
  const [retainedLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, lead.id));
  assert.equal(retainedLead.contentId, null);
  const changedLead = await updateRow(leadsTable, eq(leadsTable.id, lead.id), { notes: 'synthetic integration check', status: 'Contacted' });
  assert.equal(changedLead.notes, 'synthetic integration check');
  assert.equal((await deleteRow(leadsTable, eq(leadsTable.id, lead.id))).id, lead.id);
  assert.equal(await deleteRow(leadsTable, eq(leadsTable.id, lead.id)), undefined);
  assert.equal(await updateRow(leadsTable, eq(leadsTable.id, lead.id), { notes: 'missing' }), undefined);
  process.stdout.write(`${dialect}: synthetic CRUD, duplicate handling, JSON search/media, Unicode, timestamps and foreign-key checks passed.\n`);
} finally {
  for (const id of ids.leads) await db.delete(leadsTable).where(eq(leadsTable.id, id));
  for (const id of ids.content.reverse()) await db.delete(contentTable).where(eq(contentTable.id, id));
  for (const id of ids.admins) await db.delete(adminsTable).where(eq(adminsTable.id, id));
  await pool.end();
}
