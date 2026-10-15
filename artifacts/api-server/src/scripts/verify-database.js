// Opt-in API regression test against the selected, already prepared database.
// Only unique synthetic fixtures are modified; Microsoft email calls are mocked.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import { db, pool, dialect, contentTable, adminsTable, leadsTable, insertRow } from '@workspace/db';

const token = `db-api-${randomUUID()}`;
const ownerEmail = `${token}-owner@example.test`;
const profileEmail = `${token}-profile@example.test`;
const leadEmail = `${token}-lead@example.test`;
const password = 'Synthetic-test-password-2026';
process.env.ADMIN_EMAIL = ownerEmail;
process.env.ADMIN_PASSWORD = password;
process.env.SESSION_SECRET = 'synthetic-session-secret-for-isolated-test';
process.env.MICROSOFT_TENANT_ID = 'synthetic-tenant';
process.env.MICROSOFT_CLIENT_ID = 'synthetic-client';
process.env.MICROSOFT_CLIENT_SECRET = 'synthetic-secret';
process.env.MICROSOFT_GRAPH_MAILBOX = 'contact@4placademy.com';
const nativeFetch = globalThis.fetch;
const mail = [];
globalThis.fetch = async (url, options) => {
  if (String(url).startsWith('https://login.microsoftonline.com/')) {
    return new Response(JSON.stringify({ access_token: 'synthetic-token', expires_in: 3600 }), { status: 200 });
  }
  if (String(url).startsWith('https://graph.microsoft.com/')) {
    mail.push(JSON.parse(options.body).message);
    return new Response(null, { status: 202 });
  }
  return nativeFetch(url, options);
};
const { hashPassword } = await import('../lib/auth.js');
const { default: app, attachErrorHandler } = await import('../app.js');
attachErrorHandler();
let server;
const slugs = [token, `${token}-media`];
try {
  await insertRow(adminsTable, { email: ownerEmail, passwordHash: await hashPassword(password), role: 'admin' });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, { method = 'GET', data, cookie } = {}) => {
    const response = await nativeFetch(`${origin}/api${path}`, {
      method, headers: { ...(data ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    return { status: response.status, body: await response.json(), cookie: response.headers.getSetCookie().at(-1)?.split(';')[0] };
  };
  const login = (email, pass) => request('/admin/login', { method: 'POST', data: { email, password: pass } });
  const owner = await login(ownerEmail, password);
  assert.equal(owner.status, 200);
  assert.equal(owner.body.canManageAdmins, true);
  const adminRequest = (path, method = 'GET', data) => request(`/admin${path}`, { method, data, cookie: owner.cookie });

  const profile = await adminRequest('/profiles', 'POST', { email: profileEmail, initialPassword: password });
  assert.equal(profile.status, 201);
  assert.ok(!('passwordHash' in profile.body));
  assert.equal((await adminRequest('/profiles', 'POST', { email: profileEmail, initialPassword: password })).status, 409);
  const secondary = await login(profileEmail, password);
  assert.equal(secondary.status, 200);
  assert.equal((await request('/admin/profiles', { cookie: secondary.cookie })).status, 403);
  assert.equal((await adminRequest(`/profiles/${profile.body.id}/password`, 'POST', { newPassword: `${password}-new` })).status, 200);
  assert.equal((await request('/admin/leads', { cookie: secondary.cookie })).status, 401);
  assert.equal((await login(profileEmail, password)).status, 401);
  assert.equal((await login(profileEmail, `${password}-new`)).status, 200);

  const contentInput = { name: `Synthetic ${token}`, slug: token, status: 'draft', verified: true, description: 'नमस्ते 🤖 café', specialization: `json-${token}` };
  const content = await adminRequest('/content/courses', 'POST', contentInput);
  assert.equal(content.status, 201);
  assert.equal(content.body.description, contentInput.description);
  assert.equal((await adminRequest('/content/courses', 'POST', contentInput)).status, 409);
  assert.equal((await request(`/catalog/courses/${token}`)).status, 404);
  assert.equal((await adminRequest(`/content/courses/${content.body.id}`, 'PATCH', { ...contentInput, status: 'published' })).status, 200);
  const search = await request(`/catalog/courses?search=${encodeURIComponent(contentInput.specialization.toUpperCase())}`);
  assert.equal(search.status, 200);
  assert.ok(search.body.some((row) => row.id === content.body.id));
  const media = await adminRequest('/content/media', 'POST', { name: token, slug: slugs[1], status: 'draft', type: 'image', courseId: content.body.id, url: `/api/storage/objects/${randomUUID()}` });
  assert.equal(media.status, 201);
  assert.equal((await adminRequest(`/content/courses/${content.body.id}/permanent`, 'DELETE')).status, 409);

  const leadInput = {
    name: token, email: leadEmail, phone: '+919876543210', phoneCountry: 'IN', consent: true, category: 'counselling',
    course: contentInput.name, qualification: 'High school', city: 'Test city',
    preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    preferredTime: '14:30', timeZone: 'Asia/Kolkata', source: '/book-counselling', message: 'Synthetic inquiry 🤖',
  };
  const submission = await request('/leads', { method: 'POST', data: leadInput });
  assert.equal(submission.status, 201);
  assert.equal(submission.body.success, true);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].toRecipients[0].emailAddress.address, 'contact@4placademy.com');
  for (const value of Object.values(leadInput).filter((value) => typeof value === 'string')) assert.ok(mail[0].body.content.includes(value));
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.email, leadEmail));
  assert.equal(lead.contentId, content.body.id);
  assert.equal((await adminRequest(`/leads/${lead.id}`, 'PATCH', { status: 'Contacted', notes: 'Synthetic edited notes' })).status, 200);
  const listing = await adminRequest('/leads');
  assert.equal(listing.body.find((row) => row.id === lead.id).notes, 'Synthetic edited notes');
  assert.equal((await adminRequest(`/content/courses/${content.body.id}`, 'DELETE')).status, 200);
  assert.equal((await request(`/catalog/courses/${token}`)).status, 404);
  assert.equal((await adminRequest(`/content/courses/${content.body.id}`, 'PATCH', { ...contentInput, status: 'published' })).status, 200);
  assert.equal((await adminRequest(`/content/media/${media.body.id}/permanent`, 'DELETE')).status, 200);
  assert.equal((await adminRequest(`/content/courses/${content.body.id}/permanent`, 'DELETE')).status, 200);
  const [retainedLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, lead.id));
  assert.equal(retainedLead.contentId, null);
  assert.equal(retainedLead.message, leadInput.message);
  assert.equal((await adminRequest(`/leads/${lead.id}`, 'DELETE')).status, 200);
  assert.equal((await adminRequest(`/leads/${lead.id}`, 'DELETE')).status, 404);
  process.stdout.write(`${dialect}: API login/profile reset, content publish/archive/delete, reference protection, lead save/edit/delete and full email-body checks passed (no real email sent).\n`);
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  globalThis.fetch = nativeFetch;
  await db.delete(leadsTable).where(eq(leadsTable.email, leadEmail));
  await db.delete(contentTable).where(eq(contentTable.slug, slugs[1]));
  await db.delete(contentTable).where(eq(contentTable.slug, slugs[0]));
  await db.delete(adminsTable).where(inArray(adminsTable.email, [ownerEmail, profileEmail]));
  await pool.end();
}
