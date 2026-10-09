import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { db, contentTable, adminsTable, sessionsTable, leadsTable } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';
import { AdminLoginBody, ChangeAdminPasswordBody, CreateContentBody, UpdateContentBody, UpdateLeadBody, GetAdminDashboardResponse, ListAdminLeadsResponse } from '@workspace/api-zod';
import { currentAdmin, requireAdmin, createSession, removeSession, verifyPassword, hashPassword, initializeAdmin } from '../lib/auth.js';
import { getCatalog, checkKind, publicContent, contentValues } from '../lib/content.js';
import { validateLeadPhone } from '../lib/lead-phone.js';
import { validateLeadSchedule } from '../lib/lead-schedule.js';
import { resolveLeadContentId } from '../lib/lead-content.js';

const router = Router();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' } });
router.use((_req,res,next)=>{res.set('Cache-Control','no-store');res.set('X-Robots-Tag','noindex, nofollow');next();});
router.get('/session', async (req, res) => {
  await initializeAdmin();
  const admin = await currentAdmin(req);
  const [first] = await db.select({ id: adminsTable.id }).from(adminsTable).limit(1);
  res.json({ authenticated: Boolean(admin), setupRequired: !first, ...(admin ? { email: admin.email } : {}) });
});
router.post('/login', loginLimit, async (req, res) => {
  const data = AdminLoginBody.parse(req.body);
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, data.email.toLowerCase().trim())).limit(1);
  // Equal-cost password processing for unknown email addresses.
  const valid = admin ? await verifyPassword(data.password, admin.passwordHash) : (await hashPassword(data.password), false);
  if (!valid) { res.status(401).json({ error: 'The email or password is incorrect.' }); return; }
  await removeSession(req, res);
  await createSession(res, admin.id);
  res.json({ authenticated: true, setupRequired: false, email: admin.email });
});
router.post('/logout', async (req, res) => {
  await removeSession(req, res);
  res.json({ success: true, message: 'Signed out.' });
});
router.use(requireAdmin);
router.post('/password', loginLimit, async (req, res) => {
  const input = ChangeAdminPasswordBody.parse(req.body);
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, req.admin.id));
  if (!await verifyPassword(input.currentPassword, admin.passwordHash)) { res.status(400).json({ error: 'Current password is incorrect.' }); return; }
  await db.transaction(async tx => {
    await tx.update(adminsTable).set({ passwordHash: await hashPassword(input.newPassword) }).where(eq(adminsTable.id, admin.id));
    await tx.delete(sessionsTable).where(eq(sessionsTable.adminId, admin.id));
  });
  await createSession(res, admin.id);
  res.json({ success: true, message: 'Password updated. Other sessions have been signed out.' });
});
router.get('/dashboard', async (_req, res) => {
  const all = await db.select().from(contentTable);
  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  const counts = kind => all.filter(c => c.kind === kind && c.status !== 'archived').length;
  const stages = new Map();
  leads.forEach(l => stages.set(l.status, (stages.get(l.status)||0)+1));
  res.json(GetAdminDashboardResponse.parse({
    universities: counts('universities'), programs: counts('programs'), courses: counts('courses'), blogs: counts('blogs'),
    leads: leads.length, applications: leads.filter(l=>l.category==='application').length,
    needsVerification: all.filter(c=>!c.verified && c.status!=='archived').length,
    leadStages: [...stages].map(([status,count])=>({status,count})),
    recentLeads: leads.slice(0,5).map(l=>({...l,createdAt:l.createdAt.toISOString()})),
  }));
});
router.get('/content/:kind', async (req, res) => res.json(await getCatalog(req.params.kind, {}, true)));
async function validateLinkedContent(input) {
  for (const [key,kind] of [['programId','programs'],['courseId','courses']]) {
    if (!input[key]) continue;
    const [linked] = await db.select({id:contentTable.id}).from(contentTable).where(and(eq(contentTable.id,input[key]),eq(contentTable.kind,kind))).limit(1);
    if (!linked) throw Object.assign(new Error(`Choose an existing ${kind === 'programs' ? 'program' : 'course'}.`), {status:400});
  }
}
async function validateRelation(input, kind) {
  if (!input.universityId) return;
  if (!['programs','media','certifications','testimonials'].includes(kind)) throw Object.assign(new Error('This content type cannot reference a university.'), { status:400 });
  const [university] = await db.select({ id:contentTable.id }).from(contentTable).where(and(eq(contentTable.id,input.universityId),eq(contentTable.kind,'universities')));
  if (!university) throw Object.assign(new Error('Select an existing university.'), { status:400 });
}
router.post('/content/:kind', async (req, res) => {
  const kind = checkKind(req.params.kind);
  const input = CreateContentBody.parse(req.body);
  await validateRelation(input, kind);
  await validateLinkedContent(input);
  const [row] = await db.insert(contentTable).values(contentValues(input,kind)).returning();
  res.status(201).json(publicContent(row,true));
});
router.patch('/content/:kind/:id', async (req, res) => {
  const kind = checkKind(req.params.kind);
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error:'Invalid record.' }); return; }
  const input = UpdateContentBody.parse(req.body);
  await validateRelation(input, kind);
  await validateLinkedContent(input);
  const [existing] = await db.select().from(contentTable).where(and(eq(contentTable.id,id),eq(contentTable.kind,kind))).limit(1);
  if (!existing) { res.status(404).json({ error:'Record not found.' }); return; }
  const merged = { ...publicContent(existing,true), ...input };
  const [row] = await db.update(contentTable).set(contentValues(merged,kind)).where(and(eq(contentTable.id,id),eq(contentTable.kind,kind))).returning();
  res.json(publicContent(row,true));
});
router.delete('/content/:kind/:id', async (req, res) => {
  const kind = checkKind(req.params.kind);
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({error:'Invalid record.'});return; }
  const [row] = await db.update(contentTable).set({ status:'archived', updatedAt:new Date() }).where(and(eq(contentTable.id,id),eq(contentTable.kind,kind))).returning();
  if (!row) { res.status(404).json({error:'Record not found.'});return; }
  res.json({success:true,message:'Archived. This content can be restored from the CMS.'});
});
router.get('/leads', async (_req,res) => {
  const rows = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt)).limit(5000);
  res.json(ListAdminLeadsResponse.parse(rows.map(r=>({...r,createdAt:r.createdAt.toISOString()}))));
});
router.patch('/leads/:id', async (req,res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id<=0) { res.status(400).json({error:'Invalid enquiry.'});return; }
  const input = UpdateLeadBody.parse(req.body);
  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.id,id)).limit(1);
  if (!existing) { res.status(404).json({ error: 'Lead not found.' }); return; }
  if (['preferredDate','preferredTime','timeZone'].some(field => input[field] !== undefined)) {
    const schedule = validateLeadSchedule({ ...existing, ...input }, { allowPast: true });
    if (schedule.error) { res.status(400).json({ error: schedule.error }); return; }
    Object.assign(input, schedule.fields);
  }
  if (input.phone !== undefined || input.phoneCountry !== undefined) {
    const phone = validateLeadPhone(input.phone ?? existing.phone, input.phoneCountry ?? existing.phoneCountry);
    if (phone.error) { res.status(400).json({ error: phone.error }); return; }
    Object.assign(input, phone);
  }
  if (input.name !== undefined) {
    input.name = input.name.trim();
    if (input.name.length < 2) { res.status(400).json({ error: 'Enter the lead’s full name.' }); return; }
  }
  if (input.email !== undefined) input.email = input.email.trim().toLowerCase();
  if (['program','course','university'].some((field) => input[field] !== undefined)) {
    input.contentId = await resolveLeadContentId({ ...existing, ...input });
  }
  const [row] = await db.update(leadsTable).set({...input,updatedAt:new Date()}).where(eq(leadsTable.id,id)).returning();
  if (!row) { res.status(404).json({error:'Enquiry not found.'});return; }
  res.json({...row,createdAt:row.createdAt.toISOString()});
});
router.delete('/leads/:id', async (req,res) => {
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'Invalid lead identifier.'});return;}
  const [row]=await db.delete(leadsTable).where(eq(leadsTable.id,id)).returning({id:leadsTable.id});
  if(!row){res.status(404).json({error:'Lead not found.'});return;}
  res.json({success:true,message:'Lead permanently deleted. Previously sent email copies are unchanged.'});
});
export default router;
