import { Router } from 'express';
import { db, contentTable, leadsTable } from '@workspace/db';
import { and, eq } from 'drizzle-orm';
import { ListContentQueryParams, GetContentResponse, ListContentResponse, SubmitLeadBody, AskAcadBotBody, GetDiscoveryResponse } from '@workspace/api-zod';
import { getCatalog, checkKind, publicContent } from '../lib/content.js';
import { answerQuestion } from '../lib/chat.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const submissionLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Please try again later.' } });
const chatLimit = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Please wait before sending more messages.' } });
router.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
router.get('/catalog/:kind', async (req, res) => {
  const filters = ListContentQueryParams.parse(req.query);
  const rows = await getCatalog(req.params.kind, filters);
  res.set('Cache-Control', 'no-cache').json(ListContentResponse.parse(rows));
});
router.get('/catalog/:kind/:slug', async (req, res) => {
  checkKind(req.params.kind);
  const [row] = await db.select().from(contentTable).where(and(eq(contentTable.kind, req.params.kind), eq(contentTable.slug, req.params.slug), eq(contentTable.status, 'published'))).limit(1);
  if (!row) { res.status(404).json({ error: 'This page is not available.' }); return; }
  const item = publicContent(row);
  if (row.universityId) {
    const [university] = await db.select({ name: contentTable.name }).from(contentTable).where(eq(contentTable.id, row.universityId)).limit(1);
    item.universityName = university?.name || '';
  }
  res.set('Cache-Control', 'no-cache').json(GetContentResponse.parse(item));
});
router.get('/discovery', async (_req, res) => {
  const [universities, programs, courses] = await Promise.all(['universities','programs','courses'].map(kind => getCatalog(kind)));
  const unique = list => [...new Set(list.filter(Boolean))].sort();
  res.json(GetDiscoveryResponse.parse({
    universities: universities.length, programs: programs.length, courses: courses.length,
    locations: unique([...universities,...programs].map(c=>c.location)),
    degrees: unique(programs.map(c=>c.degree)),
    categories: unique(courses.map(c=>c.category)),
  }));
});
async function saveLead(req, res) {
  const data = SubmitLeadBody.parse(req.body);
  if (!data.consent) { res.status(400).json({ error: 'Consent is required to send your enquiry.' }); return; }
  if (!/^[+\d\s()-]{7,25}$/.test(data.phone) || data.phone.replace(/\D/g,'').length < 7) { res.status(400).json({ error: 'Please enter a valid phone number.' }); return; }
  let contentId = null;
  const name = data.program || data.course || data.university;
  if (name) {
    const conditions = [eq(contentTable.name, name), eq(contentTable.status, 'published')];
    if (data.program) {
      conditions.push(eq(contentTable.kind, 'programs'));
      if (data.university) {
        const [university] = await db.select({ id: contentTable.id }).from(contentTable).where(and(eq(contentTable.kind, 'universities'), eq(contentTable.name, data.university), eq(contentTable.status, 'published'))).limit(1);
        // Same degree title can belong to several universities. Never associate
        // an enquiry with a different institution just because its name matches.
        conditions.push(eq(contentTable.universityId, university?.id ?? -1));
      }
    } else {
      conditions.push(eq(contentTable.kind, data.course ? 'courses' : 'universities'));
    }
    const [content] = await db.select({ id: contentTable.id }).from(contentTable).where(and(...conditions)).limit(1);
    contentId = content?.id || null;
  }
  await db.insert(leadsTable).values({ ...data, name: data.name.trim(), email: data.email.trim().toLowerCase(), contentId });
  res.status(201).json({ success: true, message: data.category === 'application' ? 'Your application enquiry has been received. The admissions team will review it. This does not confirm admission.' : 'Thank you. Your enquiry has been saved for the 4PL admissions team.' });
}
router.post('/leads', submissionLimit, saveLead);
router.post('/applications', submissionLimit, (req,res,next) => { req.body.category = 'application'; return saveLead(req,res).catch(next); });
router.post('/counselling', submissionLimit, (req,res,next) => { req.body.category = 'counselling'; return saveLead(req,res).catch(next); });
router.post('/chat', chatLimit, async (req, res) => {
  const { message } = AskAcadBotBody.parse(req.body);
  res.json(await answerQuestion(message));
});
export default router;
