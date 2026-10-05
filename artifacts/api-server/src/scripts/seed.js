import '../lib/config.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { db, pool, contentTable } from '@workspace/db';
import { contentValues } from '../lib/content.js';
import { logger } from '../lib/log.js';
import { seedHomepage } from './seed-homepage.js';
import { seedDiscovery } from './seed-discovery.js';

const root = path.resolve(import.meta.dirname,'../../../../');
const slugify = name => name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
async function insert(kind, input) {
  const [row] = await db.insert(contentTable).values(contentValues({status:'published',...input},kind)).onConflictDoNothing().returning();
  if(row) return row;
  const { eq,and }=await import('drizzle-orm');
  const [existing]=await db.select().from(contentTable).where(and(eq(contentTable.kind,kind),eq(contentTable.slug,input.slug)));
  return existing;
}
const rows = JSON.parse(await readFile(path.join(root,'scripts/data/institutions.json'),'utf8'));
let added=0;
for (const r of rows) {
  let name = r.name;
  // No inference of official institution identities from consultant annotations.
  const slug=slugify(name)+(r.name==='IIBS'?`-${slugify(r.location)}`:'');
  const notes=['Imported from supplied Student Grad spreadsheet; directory inclusion does not establish a 4PL partnership. Fees, duration, eligibility, recognition and admissions links require review.'];
  let location=r.location;
  if(location==='di'){notes.push('Source location is "di"; do not assume Pune.');location='';}
  let applicationUrl=/^https?:\/\/[^\s]+$/.test(r.applicationLink)?r.applicationLink:'';
  if(!applicationUrl && r.applicationLink)notes.push('Non-URL / multiple-link source value: '+r.applicationLink);
  if(r.name==='NDIM' && /fostiima/i.test(applicationUrl)){notes.push('CONFLICT: NDIM source application link points to Fostiima. Withheld until verified.');applicationUrl='';}
  if(r.name.includes('Goenka'))notes.push('Possible duplicate GD Goenka entry with different consultant attribution. Preserve until reviewed.');
  if(r.name==='IIBS')notes.push('Possible duplicate IIBS listings with differing locations; preserve source entries until reviewed.');
  if(/bit\.ly|gibsly|link\.|go\.dbuu/.test(applicationUrl))notes.push('Shortened link destination has not been verified.');
  const university = await insert('universities',{
    name,slug,location,city:location,country:'India',category:r.region,
    description:`${name} is included in the supplied institution directory${location?` for ${location}`:''}. The source lists: ${r.courses}. Contact the admissions team to verify current program details and availability.`,
    shortDescription:`Explore ${r.courses} options${location?` in ${location}`:''}. Details to be verified.`,
    applicationUrl,verified:false,partnershipVerified:false,source:`Supplied Student Grad workbook, row ${r.sourceRow}`,
    verificationNotes:notes.join('\n'),couponCode:r.couponCode==='NA'?'':r.couponCode,
    featured:r.name==='Sushant University'||r.name==='Bennett University'||r.name==='K R Mangalam University',
    seoTitle:`${name} — Programs & Admissions | 4PL Academy`,
    seoDescription:`Explore the supplied ${name} institution listing. Contact 4PL Academy for verified program and admissions information.`,
  });
  let programs=[];
  if(r.courses==='PGDM')programs=[{name:'PGDM',degree:'PGDM',degreeLevel:'Postgraduate'}];
  else if(/BBA BCA/.test(r.courses))programs=[{name:'BBA',degree:'BBA',degreeLevel:'Undergraduate'},{name:'BCA',degree:'BCA',degreeLevel:'Undergraduate'}];
  else if(/Btech/i.test(r.courses))programs=[{name:'B.Tech',degree:'B.Tech',degreeLevel:'Undergraduate'}];
  else if(r.courses==='UG & PG')programs=[{name:'Undergraduate programs',degree:'',degreeLevel:'Undergraduate'},{name:'Postgraduate programs',degree:'',degreeLevel:'Postgraduate'}];
  else if(/UG/.test(r.courses))programs=[{name:'Undergraduate programs',degree:'',degreeLevel:'Undergraduate'}];
  for(const p of programs) {
    await insert('programs',{...p,name:`${p.name} at ${name}`,slug:`${slug}-${slugify(p.name)}`,universityId:university.id,location,applicationUrl,source:`Supplied Student Grad workbook, row ${r.sourceRow}`,verified:false,
      shortDescription:`${r.courses} listed in the supplied directory. Program details to be verified.`,
      description:`The source directory lists ${r.courses} at ${name}. This is an admissions discovery listing, not confirmation of a specific specialization, degree availability or 4PL partnership. Please request counselling for current details.`,
      verificationNotes:notes.join('\n')});
  }
  added++;
}
const officialSource='https://4placademy.com/';
const degreePrograms=[
  {name:'BBA in Artificial Intelligence (AI)',degree:'BBA',degreeLevel:'Undergraduate',specialization:'Artificial Intelligence',shortDescription:'An industry-integrated BBA pathway combining business learning with artificial intelligence.'},
  {name:'BBA in Global Logistics',degree:'BBA',degreeLevel:'Undergraduate',specialization:'Global Logistics',shortDescription:'An industry-integrated BBA pathway focused on global logistics and practical learning.'},
  {name:'BBA in Digital Marketing',degree:'BBA',degreeLevel:'Undergraduate',specialization:'Digital Marketing',shortDescription:'An industry-integrated BBA pathway connecting business education with digital marketing.'},
  {name:'MBA / PGDM in International Supply Chain Management',degree:'MBA / PGDM',degreeLevel:'Postgraduate',specialization:'International Supply Chain Management',shortDescription:'A career-focused postgraduate pathway connecting academic learning with industry exposure.'},
];
for(const [index,p] of degreePrograms.entries())await insert('programs',{...p,slug:slugify(p.name),description:p.shortDescription,featured:true,sortOrder:index-10,verified:true,source:officialSource,
  verificationNotes:'Program name confirmed on the official 4PL homepage. No individual university allocation, fee, duration, eligibility or placement guarantee verified.'});
const shortCourses=['Foundation To Trade Compliance','Customs Valuation','COO & FTA','Foundation Course in Global Logistics','Foundation Course in Export Import & International Trade','Foundation Course in Incoterms 2020','Foundation Course in Letter of Credit','Foundation Course in Shipping & Trade Documentation'];
const longCourses=['Master Course','Trade Compliance','CTCP','Logistics Management'];
for(const category of ['Short-term','Long-term'])for(const name of category==='Short-term'?shortCourses:longCourses)await insert('courses',{
  name,slug:slugify(name),category,source:'User-approved 4PL Academy website brief',verified:true,featured:['Foundation To Trade Compliance','Foundation Course in Global Logistics','Logistics Management'].includes(name),
  shortDescription:'A 4PL Academy professional learning course. Contact the team for verified curriculum, duration, fees and availability.',
  description:'This course is included in the approved 4PL professional course list. Further course information is to be verified before enrolment.',
  verificationNotes:'Only course name and short/long-term classification supplied. Curriculum, certification, hours, duration and fees are not verified.',
});
const pages=[
  {slug:'home',name:'Creating Global Professionals',shortDescription:'Industry-integrated education built for real-world careers.',description:'4PL Academy bridges universities and industry to create career-ready graduates. Explore industry-integrated degree programs, practical learning and professional courses.',
    highlights:['Industry-led learning','Real work experience','Career-focused programs','Global exposure']},
  {slug:'about',name:'About 4PL Academy',shortDescription:'The learning arm of 4PL Consultancy Ltd.',description:'4PL Academy connects universities, students and industry through the University Alliance Program. Its Admission–Training–Placement model combines academic learning with practical training, live projects and career support.',
    highlights:['Universities deliver academic foundations','4PL Consultancy provides industry expertise and practical training','Industry exposure supports real-world learning']},
  {slug:'career-industry',name:'Learning that connects to industry',shortDescription:'Build practical capability alongside academic knowledge.',description:'The University Alliance model includes practical learning through projects and simulations, industry-led sessions and workshops, and exposure to AI and real business tools. Internship opportunities and structured career pathways support student development. Pre-Placement Offer opportunities depend on performance; employment and salary are not guaranteed.',
    highlights:['Supply Chain & Logistics','Trade Compliance','AI & Business Analytics','Digital Marketing','Operations & Business Management'],
    outcomes:['Practical learning','Projects and simulations','Industry exposure','Career preparation']},
  {slug:'student-life',name:'A practical learning experience',shortDescription:'Knowledge, skills and industry exposure.',description:'4PL’s learning model gives students practical learning through projects, expert-led workshops and simulations. Campus-specific facilities, activities and student services should be confirmed with the relevant institution.',
    highlights:['Real-world projects','Industry mentors and networks','Structured career pathways','Global business exposure']},
  {slug:'for-universities',name:'Build the future of education together',shortDescription:'Connect academic excellence with industry expertise.',description:'4PL works alongside universities to enhance program delivery through curriculum integration, expert-led training, live projects and career pathways. The University Alliance Program supports stronger academic–industry collaboration and industry-integrated education.',
    highlights:['Curriculum integration','Training and sessions','Live projects','Career pathways']},
  {slug:'contact',name:'Talk to 4PL Academy',description:'Request counselling, ask about a professional course or discuss a university collaboration. Our enquiry form saves your request for the admissions team.',
    applicationUrl:'https://bookings.cloud.microsoft/book/FreeUniversityCounselling@4plconsultancy.co.uk/?ismsaljsauthenabled'},
  {slug:'privacy',name:'Privacy information',status:'draft',description:'Privacy policy requires approval before public release.',verified:false},
  {slug:'refund-policy',name:'Refund policy',status:'draft',description:'Refund terms require verification and approval. Do not infer terms from course availability.',verified:false},
];
for(const page of pages)await insert('pages',{source:officialSource,verified:true,...page,seoTitle:`${page.name} | 4PL Academy`,seoDescription:page.shortDescription||page.description.slice(0,155)});
const faqs=[
 ['What is 4PL Academy?','4PL Academy is the learning arm of 4PL Consultancy Ltd. Its University Alliance model connects universities and industry to create career-ready graduates.'],
 ['Which industry-integrated degree programs are listed?','The official 4PL website lists BBA in Artificial Intelligence, BBA in Global Logistics, BBA in Digital Marketing, and MBA / PGDM in International Supply Chain Management. University-specific availability and admission details must be verified.'],
 ['What is the Admission–Training–Placement model?','Admission provides structured onboarding and program mapping. Training includes projects, simulations and expert-led sessions. Placement support includes internship opportunities and career pathways. Employment is not guaranteed.'],
 ['Are all directory institutions confirmed 4PL partners?','No. Institution directory entries come from the supplied Student Grad spreadsheet and do not establish a 4PL partnership. Confirmed partnerships require separate verification.'],
 ['Where can I confirm fees and eligibility?','Request counselling to confirm current fees, eligibility and admissions availability. Missing details are marked as information to be verified.'],
 ['Does 4PL guarantee a job or admission?','No admission, job, salary, scholarship or visa guarantee is made. Pre-Placement Offer opportunities described on the official site depend on performance.'],
];
for(const [index,[name,description]] of faqs.entries())await insert('faqs',{name,description,slug:slugify(name),source:officialSource,verified:true,sortOrder:index});
await seedHomepage(rows);
await seedDiscovery();
logger.info({institutionRecords:added},'Seed import complete. Existing CMS records were not overwritten.');
await pool.end();
