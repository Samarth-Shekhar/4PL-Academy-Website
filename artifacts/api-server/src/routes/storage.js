import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { rateLimit } from 'express-rate-limit';
import { db, contentTable, jsonText, mediaReferences } from '@workspace/db';
import { eq, and, or } from 'drizzle-orm';
import { RequestMediaUploadBody } from '@workspace/api-zod';
import { currentAdmin, requireAdmin } from '../lib/auth.js';
import { signMediaObject } from '../lib/media-storage.js';

const router = Router();
const mimeTypes = new Set(['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']);
router.post('/uploads/request-url', requireAdmin,
  rateLimit({windowMs:60000,limit:20,standardHeaders:'draft-7',legacyHeaders:false}),
  async (req,res) => {
    const input = RequestMediaUploadBody.parse(req.body);
    if (input.contentType.startsWith('image/') && input.size > 10485760) {
      res.status(400).json({error:'Images must be 10 MB or smaller.'}); return;
    }
    const id = randomUUID();
    res.set('Cache-Control','no-store');
    res.json({uploadURL:await signMediaObject(id,'PUT'),objectPath:`/api/storage/objects/${id}`});
  });
router.get('/objects/:id', async(req,res,next) => {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(req.params.id)) {
    res.status(404).json({error:'Media not found.'}); return;
  }
  const objectPath = `/api/storage/objects/${req.params.id}`;
  const admin = await currentAdmin(req);
  const [approved] = await db.select({id:contentTable.id}).from(contentTable).where(and(
    eq(contentTable.status,'published'),eq(contentTable.verified,true),
    or(
      ...['url','image','logo','ogImage','posterUrl','thumbnailUrl'].map((key) => eq(jsonText(contentTable.data, key), objectPath)),
      mediaReferences(contentTable.data, objectPath),
    ),
  )).limit(1);
  if (!approved && admin?.role !== 'admin') {
    res.status(404).json({error:'Media not found.'}); return;
  }
  const range = req.get('Range');
  if (range && !/^bytes=\d*-\d*$/.test(range)) {res.status(416).end();return;}
  const upstream = await fetch(await signMediaObject(req.params.id,'GET'), {
    headers:range ? {Range:range} : {},signal:AbortSignal.timeout(60000),
  });
  if (!upstream.ok) {res.status(upstream.status === 416 ? 416 : 404).end(); return;}
  const mime = upstream.headers.get('Content-Type')?.split(';')[0];
  const total = Number(upstream.headers.get('Content-Range')?.split('/')[1] || upstream.headers.get('Content-Length'));
  if (!mimeTypes.has(mime) || total > 26214400) {await upstream.body?.cancel();res.status(415).end();return;}
  res.status(upstream.status).set('Content-Type',mime).set('X-Content-Type-Options','nosniff');
  res.set('Cache-Control',admin ? 'private, no-store' : 'public, max-age=60');
  for (const header of ['Content-Length','Content-Range','Accept-Ranges']) {
    const value = upstream.headers.get(header); if (value) res.set(header,value);
  }
  try { await pipeline(Readable.fromWeb(upstream.body),res); }
  catch (err) {if (!res.headersSent) next(err); else res.destroy();}
});
export default router;
