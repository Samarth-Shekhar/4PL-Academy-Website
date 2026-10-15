import { db, contentTable, insertRow } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { contentValues } from '../lib/content.js';

const image = name => `/images/editorial/${name}.webp`;
const step = (name,description,photo,url='') => ({name,description,image:image(photo),url});
const sections = [
  {
    slug:'hero',name:'Creating Global Professionals',
    shortDescription:'Industry-integrated education built for real-world careers.',
    description:'Explore degree pathways and professional learning shaped by the world of work.',
    ctaLabel:'Explore Programs',ctaUrl:'/programs',secondaryCtaLabel:'Book Counselling',secondaryCtaUrl:'/counselling',
    image:image('port'),
  },
  {
    slug:'ecosystem',name:'Where Education Meets Industry',
    shortDescription:'One place to explore education, professional learning and career development.',
    description:'Institution directory counts are not a count of confirmed 4PL partnerships.',
    items:[
      {name:'Universities',description:'Discover institutions and explore the available directory information.',url:'/universities'},
      {name:'Industry',description:'Connect learning with the practical challenges of business.',url:'/career-industry'},
      {name:'Professional Learning',description:'Explore focused courses for the world of work.',url:'/courses'},
      {name:'Career Development',description:'Understand career pathways and admissions support.',url:'/counselling'},
    ],
  },
  {
    slug:'programs',name:'Choose the Path That Moves You Forward',
    shortDescription:'Start with your ambition. Discover a pathway to match.',
    description:'Confirm current duration, mode, eligibility and fees with admissions before applying.',
    ctaLabel:'Explore all programs',ctaUrl:'/programs',secondaryCtaLabel:'Book Counselling',secondaryCtaUrl:'/counselling',
  },
  {
    slug:'universities',name:'One Academy. A Growing University Network.',
    shortDescription:'Explore institutions across India, one region at a time.',
    description:'Directory entries do not confirm a 4PL partnership. Map pins show approximate city centres, not campus addresses. Confirmed partners are identified separately.',
    ctaLabel:'Explore universities',ctaUrl:'/universities',secondaryCtaLabel:'Book Counselling',secondaryCtaUrl:'/counselling',
  },
  {
    slug:'industry',name:'Learn With Industry. Build For Industry.',
    shortDescription:'Professional learning grounded in the work that moves the world.',
    description:'Company logos appear only after the relationship has been verified. Partners, clients and industry associations are labelled separately.',
    image:image('business'),ctaLabel:'Explore career & industry',ctaUrl:'/career-industry',
  },
  {
    slug:'practical',name:'Learn By Doing.',
    shortDescription:'A closer look at the subjects behind professional learning.',
    description:'Illustrative learning environments—not footage of a specific 4PL program, campus or event. Delivery and activities vary by program.',
    items:[
      step('Supply chain in practice','See how goods, information and people move together.','warehouse','/programs'),
      step('Across borders','Explore the systems behind shipping and global trade.','trade','/courses'),
      step('Business decisions','Understand how teams plan, collaborate and solve problems.','business','/programs'),
      step('Technology at work','Discover where technology meets business and professional learning.','technology','/programs'),
    ],
    ctaLabel:'Explore professional courses',ctaUrl:'/courses',
  },
  {
    slug:'certifications',name:'Build Skills. Earn Credentials.',
    shortDescription:'Explore verified certifications and credential pathways.',
    description:'Issuers, credential requirements and duration appear only when approved information is available. A course listing alone does not establish certification or accreditation.',
    ctaLabel:'Ask about credentials',ctaUrl:'/counselling',
  },
  {
    slug:'journey',name:'A Journey Built Around Growth',
    shortDescription:'From understanding a subject to exploring the next step.',
    description:'An illustrative learning journey. Projects, industry exposure, internships and credentials depend on the selected program; employment is not guaranteed.',
    items:[
      step('Learn','Build your understanding.','classroom'),
      step('Practice','Apply ideas to practical situations.','warehouse'),
      step('Build','Turn learning into projects.','technology'),
      step('Experience','Explore industry contexts.','trade'),
      step('Certify','Confirm the credentials offered by your chosen pathway.','business','/counselling'),
      step('Launch','Prepare for your next professional step.','port','/career-industry'),
    ],
  },
  {
    slug:'careers',name:'From Learning to Career',
    shortDescription:'Explore the fields connected to approved 4PL degree pathways.',
    description:'Career pathways are areas to explore—not a guarantee of placement, employment or salary.',
    image:image('warehouse'),ctaLabel:'Explore career pathways',ctaUrl:'/career-industry',
    secondaryCtaLabel:'Book Counselling',secondaryCtaUrl:'/counselling',
  },
  {
    slug:'student-life',name:'Learning Happens Together',
    shortDescription:'Conversations, collaboration and ideas beyond the timetable.',
    description:'Illustrative photography, not a specific 4PL campus or student event. Approved campus and event media can be added through the CMS.',
    image:image('classroom'),ctaLabel:'Explore student life',ctaUrl:'/student-life',
    items:[
      step('Shared ideas','Learning through conversation.','classroom'),
      step('Professional perspectives','Connect with the subjects behind business.','business'),
      step('Projects and possibilities','Explore technology and practical thinking.','technology'),
    ],
  },
  {
    slug:'gallery',name:'Life at 4PL',
    shortDescription:'Approved moments from classrooms, workshops, projects and events.',
    description:'Only approved 4PL, student or university media is shown here. No stock photography is presented as a real event.',
    ctaLabel:'Explore student life',ctaUrl:'/student-life',
  },
  {
    slug:'testimonials',name:'In Their Own Words',
    shortDescription:'Real experiences, shared with permission.',
    description:'Testimonials appear here only after approval. No sample quotes, fictional students or fabricated outcomes are used.',
    ctaLabel:'Speak with admissions',ctaUrl:'/counselling',
  },
  {
    slug:'admissions',name:'Your Journey Starts With a Conversation',
    shortDescription:'Explore your options. Ask questions. Make an informed choice.',
    description:'Admissions requirements and final decisions belong to the relevant institution. Counselling and an enquiry do not guarantee admission.',
    items:[
      step('Explore','Discover institutions, programs and professional courses.','port','/programs'),
       step('Book Counselling','Confirm eligibility, availability and current details.','business','/counselling'),
       step('Choose Program','Compare the pathways that interest you.','classroom','/programs'),
      step('Admission','Complete the institution’s requirements and await its decision.','classroom','/counselling'),
      step('Start Learning','Begin after admission and enrolment are confirmed.','warehouse','/student-life'),
    ],
    ctaLabel:'Book Counselling',ctaUrl:'/counselling',
    secondaryCtaLabel:'',secondaryCtaUrl:'',
  },
  {
    slug:'final-cta',name:'Your Next Chapter Starts Here.',
    shortDescription:'Explore programs, discover universities and build skills for the world of work.',
    image:image('trade'),ctaLabel:'Book Counselling',ctaUrl:'/counselling',
    secondaryCtaLabel:'Find a University',secondaryCtaUrl:'/universities',
    items:[{name:'Talk to ACAD BOT',url:'bot'}],
  },
];

const photos = [
  ['port','Global trade','Container port and global shipping','https://www.pexels.com/photo/14020705/'],
  ['business','Business management','Professionals collaborating in a meeting','https://www.pexels.com/photo/7964413/'],
  ['trade','International trade','Cargo ship and cranes at a port','https://www.pexels.com/photo/10830068/'],
  ['classroom','University education','Learners collaborating in a classroom','https://www.pexels.com/photo/8199143/'],
  ['technology','Technology at work','A professional working on a laptop','https://www.pexels.com/photo/7172094/'],
  ['warehouse','Supply chain','Warehouse professionals discussing inventory','https://www.pexels.com/photo/4480987/'],
];

async function add(kind,input) {
  await insertRow(contentTable, contentValues({
    status:'published',verified:true,featured:true,...input,
  },kind), { ignoreConflict: true });
}
export async function seedHomepage(sourceInstitutions = []) {
  const catalog = await db.select().from(contentTable);
  const pathways = catalog.filter(r=>r.kind==='programs' && r.verified && r.featured && !r.universityId);
  const photoFor = name => /\bai\b|artificial|digital|technology/i.test(name) ? 'technology'
    : /logistic|supply|warehouse/i.test(name) ? 'warehouse'
    : /trade|export|import|cargo/i.test(name) ? 'trade' : 'business';
  for (const row of catalog.filter(r=>r.verified && (r.kind==='courses' || pathways.some(p=>p.id===r.id)))) {
    if (Object.hasOwn(row.data,'image')) continue;
    await db.update(contentTable).set({data:{...row.data,image:image(photoFor(row.name))}}).where(eq(contentTable.id,row.id));
  }
  const careerItems = pathways.map(p=>({
    name:p.data.specialization || p.name,
    description:p.data.shortDescription || 'Explore this approved degree pathway and confirm the current program details with admissions.',
    image:image(photoFor(p.name)),url:`/programs/${p.slug}`,
    altText:'Illustrative professional learning environment.',
  }));
  for (const [sortOrder,section] of sections.entries()) {
    await add('homepage',{...section,...(section.slug==='careers'?{items:careerItems}:{}),section:section.slug,enabled:true,sortOrder,source:'Approved visual-direction brief supplied by the project owner.'});
  }
  const [careers] = await db.select().from(contentTable).where(and(eq(contentTable.kind,'homepage'),eq(contentTable.slug,'careers'))).limit(1);
  if (careers && !Object.hasOwn(careers.data,'items')) {
    await db.update(contentTable).set({data:{...careers.data,items:careerItems}}).where(eq(contentTable.id,careers.id));
  }
  for (const [sortOrder,[key,name,altText,source]] of photos.entries()) {
    await add('media',{
      name,slug:`editorial-hero-${key}`,type:'image',url:image(key),image:image(key),
      posterUrl:image(key),thumbnailUrl:image(key),section:'hero',category:'Industry',
      altText,caption:'Licensed illustrative photography. Not a specific 4PL campus, participant or event.',
      source,sortOrder,
    });
  }
  // City centres only, never an inferred campus location or proof of partnership.
  const centres = {
    'greater noida':[28.4744,77.5040],'noida':[28.5355,77.3910],
    'delhi':[28.6139,77.2090],'new delhi':[28.6139,77.2090],
    'gurgaon':[28.4595,77.0266],'gurugram':[28.4595,77.0266],
    'ghaziabad':[28.6692,77.4538],'faridabad':[28.4089,77.3178],
    'pune':[18.5204,73.8567],'mumbai':[19.0760,72.8777],
    'navi mumbai':[19.0330,73.0297],
    'bangalore':[12.9716,77.5946],'bengaluru':[12.9716,77.5946],
    'dehradun':[30.3165,78.0322],'roorkee':[29.8543,77.8880],
    'jaipur':[26.9124,75.7873],'lucknow':[26.8467,80.9462],
    'chennai':[13.0827,80.2707],'hyderabad':[17.3850,78.4867],
    'kolkata':[22.5726,88.3639],'ahmedabad':[23.0225,72.5714],
  };
  const universities = await db.select().from(contentTable).where(eq(contentTable.kind,'universities'));
  for (const row of universities) {
    if ('coordinateAccuracy' in row.data || row.data.latitude != null || row.data.longitude != null) continue;
    const city = row.data.city || row.location;
    const coordinates = centres[city.trim().toLowerCase()];
    const sourceRecord = sourceInstitutions.find(r=>r.name===row.name && r.location===row.location);
    const data = {...row.data,region:row.data.region || sourceRecord?.region || row.data.state || row.location,
      coordinateAccuracy:coordinates ? 'city-centre' : 'unlocated',
      latitude:coordinates?.[0] ?? null,longitude:coordinates?.[1] ?? null};
    await db.update(contentTable).set({data}).where(and(eq(contentTable.id,row.id),eq(contentTable.kind,'universities')));
  }
}
