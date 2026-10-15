import { db, contentTable, insertRow } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { contentValues } from '../lib/content.js';

const source = 'Contact information supplied in the owner-approved education discovery brief.';

export async function seedDiscovery() {
  // New initial settings only: repeated imports never overwrite subsequent CMS edits.
  for (const record of [
    {
      slug:'contact-india',name:'India Office',
      location:'4PL Academy\nUnit 907, 9th Floor, C-27,\nTrapezoid IT Park,\nSector 62, Noida,\nUttar Pradesh 201309',
      phone:'+91 8448398180',email:'contact@4placademy.com',
    },
    {
      slug:'contact-uk',name:'UK Office',
      location:'42 Grace Holland Avenue,\nPease Pottage,\nCrawley,\nWest Sussex RH11 9SL',
      phone:'+44 330 043 1245 / +44 798 018 1209',email:'admission@4plconsultancy.co.uk',
    },
  ]) {
    await insertRow(contentTable, contentValues({
      ...record,status:'published',verified:true,source,
      verificationNotes:'Owner-provided contact details. Historical alternatives remain subject to administrator review.',
    },'settings'), { ignoreConflict: true });
  }
  const homepage = await db.select().from(contentTable).where(eq(contentTable.kind,'homepage'));
  for (const row of homepage) {
    if (row.data.source !== 'Approved visual-direction brief supplied by the project owner.') continue;
    const data = {...row.data,source:'Owner-approved education discovery brief.'};
    if (data.ctaUrl === 'bot') { data.ctaLabel='Book Counselling';data.ctaUrl='/counselling'; }
    if (data.secondaryCtaUrl === 'bot') { data.secondaryCtaLabel='Book Counselling';data.secondaryCtaUrl='/counselling'; }
    if (row.slug === 'hero') data.shortDescription='Industry-integrated education built for real-world careers.';
    if (['admissions','final-cta'].includes(row.slug)) { data.ctaLabel='Book Counselling';data.ctaUrl='/counselling'; }
    if (row.slug === 'admissions' && data.items?.map(i=>i.name).join('|') === 'Explore|Choose Program|Get Counselling|Apply|Admission|Start Learning') {
      data.items=[data.items[0],{...data.items[2],name:'Book Counselling'},data.items[1],...data.items.slice(3)];
    }
    await db.update(contentTable).set({data,updatedAt:new Date()}).where(eq(contentTable.id,row.id));
  }
}
