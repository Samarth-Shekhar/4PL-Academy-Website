import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { db, contentTable, pool } from '@workspace/db';
import { eq } from 'drizzle-orm';
import * as validation from '@workspace/api-zod';
import { contentValues } from '../lib/content.js';
import { renderMetadata } from '../lib/seo.js';
import { captureAttribution } from '../../../academy/src/lib/booking.js';

const base = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : `http://localhost:${process.env.PORT || 5000}`;
const get = async path => {
  const res = await fetch(base + '/api' + path);
  assert.equal(res.status, 200, path);
  return res.json();
};
let temporaryId;
try {
  const attribution = 'utm_source=qa&utm_campaign=Discovery+%26+Careers';
  assert.equal(captureAttribution('?'+attribution),attribution);
  assert.equal(captureAttribution(''),attribution,'Untagged internal navigation must retain the campaign, even without browser storage.');
  const input = validation.SubmitLeadBody.parse({
    name:'Contract QA',email:'contract-qa@example.invalid',phone:'+91 9000000000',phoneCountry:'IN',consent:true,
    interestedIn:'Professional',qualification:'10+2',city:'Test City',category:'counselling',
    source:'/book-counselling',utm:'utm_source=contract-check',
  });
  assert.equal(input.qualification,'10+2');
  assert.equal(input.city,'Test City');
  assert.equal(input.interestedIn,'Professional');
  const programs = await get('/catalog/programs');
  const linked = programs.find(p=>p.universityId && p.universityName);
  assert.ok(linked,'A linked directory program is needed for the search check.');
  const search = await get('/catalog/programs?search='+encodeURIComponent(linked.universityName));
  assert.ok(search.some(p=>p.id===linked.id),'University-name search must find linked programs.');
  const settings = await get('/catalog/settings');
  assert.ok(settings.some(s=>s.slug==='contact-india' && s.phone==='+91 8448398180'));
  assert.ok(settings.some(s=>s.slug==='contact-uk' && s.phone.includes('+44 330 043 1245') && s.phone.includes('+44 798 018 1209')));
  const draft = validation.CreateContentBody.parse({
    name:'Temporary discovery contract check',slug:'contract-check-'+randomUUID(),status:'draft',
    intake:'Test intake',semesters:[{name:'Test semester',modules:['Test module']}],verified:false,
  });
  const [record] = await db.insert(contentTable).values(contentValues(draft,'programs')).returning();
  temporaryId = record.id;
  assert.equal(record.data.intake,'Test intake');
  assert.equal(record.data.semesters[0].modules[0],'Test module');
  assert.equal((await fetch(base+'/api/catalog/programs/'+draft.slug)).status,404,'Draft must not leak into public details.');
  const denied = await fetch(base+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,consent:false})});
  assert.equal(denied.status,400,'Consent must be enforced by the server.');
  assert.equal((await fetch(base+'/api/admin/leads')).status,401,'Admin leads must remain protected.');
  const course = (await get('/catalog/courses'))[0];
  const metadata = await renderMetadata('<html><head></head><body></body></html>','/professional-courses/'+course.slug);
  assert.ok(metadata.includes(course.name),'New detail route must receive real metadata.');
  assert.ok(metadata.includes('"@type":"Course"'),'Approved course must receive Course schema.');
  console.log('Discovery contracts, draft persistence/privacy, university search, contact settings, consent, protected leads and course SEO passed.');
} finally {
  if (temporaryId) await db.delete(contentTable).where(eq(contentTable.id,temporaryId));
  await pool.end();
}
