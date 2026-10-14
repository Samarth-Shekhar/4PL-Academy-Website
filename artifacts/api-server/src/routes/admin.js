import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { db, contentTable, adminsTable, sessionsTable, leadsTable } from '@workspace/db';
import { eq, and, desc, asc, inArray, sql } from 'drizzle-orm';
import { AdminLoginBody, ChangeAdminPasswordBody, CreateAdminProfileBody, ResetAdminProfilePasswordBody, ListAdminProfilesResponse, CreateContentBody, UpdateContentBody, UpdateLeadBody, GetAdminDashboardResponse, ListAdminLeadsResponse } from '@workspace/api-zod';
import { currentAdmin, requireAdmin, createSession, removeSession, verifyPassword, hashPassword, initializeAdmin, isConfiguredOwner, canManageAdminProfiles } from '../lib/auth.js';
import { getCatalog, checkKind, publicContent, contentValues, publicUniversitySlugs } from '../lib/content.js';
import { validateLeadPhone } from '../lib/lead-phone.js';
import { validateLeadSchedule } from '../lib/lead-schedule.js';
import { resolveLeadContentId } from '../lib/lead-content.js';

const router = Router();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' } });
const ownerMutationLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many profile changes. Please try again later.' } });
router.use((_req,res,next)=>{res.set('Cache-Control','no-store');res.set('X-Robots-Tag','noindex, nofollow');next();});
router.get('/session', async (req, res) => {
  await initializeAdmin();
  const admin = await currentAdmin(req);
  const [first] = await db.select({ id: adminsTable.id }).from(adminsTable).limit(1);
  res.json({ authenticated: Boolean(admin), setupRequired: !first, canManageAdmins: canManageAdminProfiles(admin), ...(admin ? { email: admin.email } : {}) });
});
router.post('/login', loginLimit, async (req, res) => {
  const data = AdminLoginBody.parse(req.body);
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, data.email.toLowerCase().trim())).limit(1);
  // Equal-cost password processing for unknown email addresses.
  const valid = admin ? await verifyPassword(data.password, admin.passwordHash) : (await hashPassword(data.password), false);
  if (!valid) { res.status(401).json({ error: 'The email or password is incorrect.' }); return; }
  await removeSession(req, res);
  await createSession(res, admin.id);
  res.json({ authenticated: true, setupRequired: false, canManageAdmins: canManageAdminProfiles(admin), email: admin.email });
});
router.post('/logout', async (req, res) => {
  await removeSession(req, res);
  res.json({ success: true, message: 'Signed out.' });
});
router.use(requireAdmin);
function requireConfiguredOwner(req, res, next) {
  if (!canManageAdminProfiles(req.admin)) { res.status(403).json({ error: 'Only an authorized profile manager can manage administrator profiles.' }); return; }
  next();
}
function profileResponse(profile) {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    createdAt: profile.createdAt.toISOString(),
    isOwner: isConfiguredOwner(profile),
    canManageAdmins: canManageAdminProfiles(profile),
  };
}
router.get('/profiles', requireConfiguredOwner, async (_req, res) => {
  const profiles = await db.select({ id: adminsTable.id, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt })
    .from(adminsTable).orderBy(asc(adminsTable.id));
  res.json(ListAdminProfilesResponse.parse(profiles.map(profileResponse)));
});
router.post('/profiles', requireConfiguredOwner, ownerMutationLimit, async (req, res) => {
  const input = CreateAdminProfileBody.parse(req.body);
  const email = input.email.trim().toLowerCase();
  const [profile] = await db.insert(adminsTable)
    .values({ email, passwordHash: await hashPassword(input.initialPassword), role: 'admin' })
    .onConflictDoNothing()
    .returning({ id: adminsTable.id, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt });
  if (!profile) { res.status(409).json({ error: 'An administrator with this email already exists.' }); return; }
  res.status(201).json(ListAdminProfilesResponse.parse([profileResponse(profile)])[0]);
});
router.post('/profiles/:id/password', requireConfiguredOwner, ownerMutationLimit, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: 'Invalid administrator profile.' }); return; }
  const input = ResetAdminProfilePasswordBody.parse(req.body);
  const [profile] = await db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.id, id)).limit(1);
  if (!profile) { res.status(404).json({ error: 'Administrator profile not found.' }); return; }
  await db.transaction(async (tx) => {
    await tx.update(adminsTable).set({ passwordHash: await hashPassword(input.newPassword) }).where(eq(adminsTable.id, id));
    await tx.delete(sessionsTable).where(eq(sessionsTable.adminId, id));
  });
  if (id === req.admin.id) await createSession(res, id);
  res.json({ success: true, message: 'Password reset. Existing sessions for this account were signed out.' });
});
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
  if (kind === 'universities' && !publicUniversitySlugs.includes(input.slug)) {
    res.status(400).json({ error: 'Only IBMR Group of Institutions, Vivekananda Global University, and Sushant University can be added.' });
    return;
  }
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
  const [existing] = await db.select().from(contentTable).where(and(eq(contentTable.id,id),eq(contentTable.kind,kind))).limit(1);
  if (!existing) { res.status(404).json({ error:'Record not found.' }); return; }
  if (kind === 'universities') {
    const isApproved = publicUniversitySlugs.includes(existing.slug);
    if (isApproved ? !publicUniversitySlugs.includes(input.slug) : input.slug !== existing.slug || input.status !== 'archived') {
      res.status(400).json({ error: 'Only the three approved universities can be published. Legacy university records must remain archived until their linked content is resolved.' });
      return;
    }
  }
  await validateRelation(input, kind);
  await validateLinkedContent(input);
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
router.delete('/content/:kind/:id/permanent', async (req, res) => {
  const kind = checkKind(req.params.kind);
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: 'Invalid record.' }); return; }
  const [existing] = await db.select({ id: contentTable.id, name: contentTable.name })
    .from(contentTable).where(and(eq(contentTable.id, id), eq(contentTable.kind, kind))).limit(1);
  if (!existing) { res.status(404).json({ error: 'Record not found.' }); return; }

  let references = [];
  if (kind === 'universities') {
    references = await db.select({ kind: contentTable.kind, name: contentTable.name })
      .from(contentTable).where(eq(contentTable.universityId, id));
  } else if (kind === 'programs' || kind === 'courses') {
    const reference = kind === 'programs'
      ? sql`${contentTable.data}->>'programId' = ${String(id)}`
      : sql`${contentTable.data}->>'courseId' = ${String(id)}`;
    references = await db.select({ kind: contentTable.kind, name: contentTable.name })
      .from(contentTable)
      .where(and(inArray(contentTable.kind, ['media', 'certifications']), reference));
  }
  if (references.length) {
    const labels = [...new Set(references.map((row) => row.kind.replaceAll('_', ' ')))].join(', ');
    res.status(409).json({ error: `Cannot delete “${existing.name}” while it is linked to ${references.length} ${labels} record(s). Reassign or remove those records first.` });
    return;
  }

  const [deleted] = await db.delete(contentTable)
    .where(and(eq(contentTable.id, id), eq(contentTable.kind, kind)))
    .returning({ id: contentTable.id });
  if (!deleted) { res.status(404).json({ error: 'Record not found.' }); return; }
  res.json({
    success: true,
    message: 'Content record permanently deleted. Any related lead remains saved; uploaded files in storage are not removed.',
  });
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
