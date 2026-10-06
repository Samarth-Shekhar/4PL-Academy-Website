/**
 * Prepare a source-backed, non-destructive CMS import. Does not connect to a DB.
 * Inputs are fetched source content and a scrubbed current-content snapshot.
 * The caller applies the plan atomically using parameter-bound SQL.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const knownHeadings = /^(Courses Info|Why\?|Requirements|Topics Covered Include:|Learning Outcomes:|Key points covered in the Logistics Management course:|Benefits\/Deliverables from the course:|Key Highlights:|What makes Unique\?|By the end of this course, learners will be able to:|Who is this for\?|Learning\?)$/;
const unsupportedClaim = /pay scale|high paying|salary|salaries|job security|getting placed|5 to 6 lacs|Amazon|Walmart|Flipkart|Reliance|Mahindra Logistics|Blue Dart|\bDHL\b|\bUPS\b/iu;
const normalize = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
const clean = s => s.replace(/\*\*/g, '').replace(/^[-*>]\s*/gm, '').trim();
const placeholder = s => /included in the approved 4PL professional course list|contact the team for verified curriculum|included in the supplied institution directory|details to be verified/i.test(s || '');
const slug = s => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const checked = '2026-10-06';

function assertUnicode(value) {
  if (typeof value === 'string') assert(value.isWellFormed(), 'Import contains a lone UTF-16 surrogate; check Unicode text transformations');
  else if (Array.isArray(value)) value.forEach(assertUnicode);
  else if (value && typeof value === 'object') Object.values(value).forEach(assertUnicode);
}

function sections(markdown) {
  const result = {};
  let heading = 'Introduction';
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (knownHeadings.test(line)) { heading = line; continue; }
    (result[heading] ||= []).push(raw);
  }
  return result;
}
function bullets(value = []) {
  return value.filter(s => s.trim().startsWith('- ')).map(clean).filter(s => !unsupportedClaim.test(s));
}
function text(value = []) {
  return value.filter(s => !unsupportedClaim.test(s)).join('\n').trim();
}
function courseInfo(page) {
  const headline = page.markdown.match(/^# (.+)$/m)?.[1]?.replace(/\s+/g, ' ').trim();
  assert(headline, `Missing course heading: ${page.url}`);
  const body = page.markdown.replace(/^[\s\S]*?^# .+\n/m, '');
  const s = sections(body);
  const intro = text(s['Courses Info'] || s['Why?'] || [])
    .replace(/###### .+\n*/g, '').split('\n#### ')[0].replace(/^-\s*/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)\s*/g, '');
  let curriculum = bullets(s['Topics Covered Include:'] || s['Learning?'] || s['Key points covered in the Logistics Management course:']);
  if (/Master Course/.test(headline)) {
    let group = '';
    curriculum = [];
    for (const line of s['Courses Info'] || []) {
      if (line.startsWith('#### ')) group = line.slice(5);
      if (line.startsWith('- ')) curriculum.push(`${group}: ${clean(line)}`);
    }
  }
  const outcomes = bullets(s['Learning Outcomes:'] || s['By the end of this course, learners will be able to:'] || s['Benefits/Deliverables from the course:']);
  const audience = bullets(s['Who is this for?']);
  const requirements = bullets(s.Requirements);
  const highlights = bullets(s['Key Highlights:']);
  const unique = bullets(s['What makes Unique?']);
  const description = [intro, ...(unique.length ? ['## What makes this course different', unique.join('\n\n')] : [])].filter(Boolean).join('\n\n');
  assert(description && curriculum.length, `Incomplete fetched course: ${page.url}`);
  const data = {
    description, shortDescription: clean(intro.split('\n\n')[0]).slice(0, 320),
    curriculum, outcomes, highlights, source: page.url,
    feeNote: 'Local taxes applicable. The professional-course price does not specify a currency on the source page; confirm currency and the final payable amount with 4PL Academy.',
    seoDescription: clean(intro.split('\n\n')[0]).slice(0, 155),
  };
  if (audience.length) data.targetAudience = audience.join('\n\n');
  if (requirements.length) data.eligibility = requirements.join('; ');
  if (/^Diploma in/.test(headline)) data.certification = `${headline} (source course title; external accreditation is not asserted)`;
  if (page.url.endsWith('/logistics-management-courses.php')) {
    data.careerPaths = ['Career sectors described by the source: aviation, customer service, eCommerce, logistics, shipping and supply chain. These are areas to explore, not guaranteed jobs.'];
  }
  return { headline, data };
}

export function buildImportPlan(source, current, workbook) {
  const entries = [], conflicts = [];
  const patchData = (existing, values, replace = []) => {
    const result = {};
    for (const [key, value] of Object.entries(values)) {
      if (value === '' || (Array.isArray(value) && !value.length)) continue;
      const old = existing?.data?.[key];
      if (!old || (Array.isArray(old) && !old.length) || replace.includes(key) || placeholder(old)) result[key] = value;
      else if (JSON.stringify(old) !== JSON.stringify(value)) conflicts.push({ kind: existing.kind, slug: existing.slug, field: key, action: 'Preserved existing non-placeholder value' });
    }
    return result;
  };
  const plan = (kind, name, recordSlug, values, data, replace = []) => {
    const existing = current.find(c => c.kind === kind && c.slug === recordSlug);
    entries.push({
      kind, name: existing?.name || name, slug: recordSlug,
      ...values, existingId: existing?.id || null, expectedUpdatedAt: existing?.updated_at || null,
      data: patchData(existing, data, replace),
    });
  };
  for (const page of source.courses) {
    const info = courseInfo(page);
    const existing = current.find(c => c.kind === 'courses' &&
      (normalize(c.name) === normalize(info.headline.replace(/^Diploma in /, '')) ||
       (c.slug === 'ctcp' && page.url.endsWith('/certified-tariff-classification-professional.php')) ||
       (c.slug === 'master-course' && page.url.endsWith('/logistics-trade-compliance-courses.php'))));
    assert(existing, `Course does not match the existing catalog: ${page.url}`);
    const listing = source.pages.find(p => /\/(?:short|long)-courses.php$/.test(p.url) && p.markdown.includes(page.url));
    assert(listing, `Missing fee source: ${page.url}`);
    const block = listing.markdown.slice(listing.markdown.indexOf(`](${page.url})`));
    const fee = block.match(/\*\*([\d,]+)\*\*/)?.[1];
    const hours = block.match(/Course Hours:\s*(\d+)\s*hrs/i)?.[1];
    assert(fee && hours, `Missing source fee/hours: ${page.url}`);
    plan('courses', existing.name, existing.slug, { verified: true }, {
      ...info.data, fee, hours: `${hours} hrs`, duration: `${hours} hours of instruction`,
    }, ['source']);
  }

  const ug = source.pages.find(p => p.url.endsWith('/undergradute-courses.php'));
  const pg = source.pages.find(p => p.url.endsWith('/postgraduate-courses.php'));
  const institutionPrograms = [];
  for (const page of [ug, pg]) {
    const blocks = page.markdown.split('\n### ').slice(1);
    for (const block of blocks) {
      const university = block.match(/^\[([^\]]+)\]/)?.[1];
      const location = block.split('\n\n')[1]?.trim();
      const name = block.match(/#### \[([^\]]+)\]/)?.[1];
      const fee = block.match(/\*\*Total Course Fees :\*\*\s*([^\n]+)/)?.[1]?.trim();
      const duration = block.match(/\*\*Duration :\*\*\s*([^\n]+)/)?.[1]?.trim();
      const mode = block.match(/\*\*Mode :\*\*\s*([^\n]+)/)?.[1]?.trim();
      const batch = block.match(/\*\*Batch :\*\*\s*([^\n]+)/)?.[1]?.trim();
      const eligibility = clean(block.match(/Eligibility\s*\n+([\s\S]*?)\n+Program Highlights/)?.[1] || '');
      const highlights = bullets(block.match(/Program Highlights\s*\n+([\s\S]*?)(?:\n\nGet Prospectus|$)/)?.[1]?.split('\n'));
      assert(university && name && fee && eligibility && highlights.length, `Incomplete program source: ${page.url}`);
      const uniSlug = slug(university);
      const oldUniversity = current.find(c => c.kind === 'universities' && c.slug === uniSlug);
      const imageIndex = page.markdown.indexOf(`### [${university}]`);
      const precedingImages = [...page.markdown.slice(0, imageIndex).matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].slice(-2).map(m => m[1]);
      if (!entries.some(e => e.kind === 'universities' && e.slug === uniSlug)) {
        plan('universities', university, uniSlug,
          { verified: true, location, category: location === 'Jaipur' ? 'Rajasthan' : 'Delhi NCR', featured: true },
          {
            city: location, country: 'India', source: page.url,
            ...(oldUniversity ? {} : { region: location === 'Jaipur' ? 'Rajasthan' : 'Delhi NCR', partnershipVerified: false, coordinateAccuracy: 'unlocated' }),
            description: `${university} is listed by 4PL Academy in ${location} for the ${batch} intake. The linked program pages show the source-published eligibility, duration, delivery mode and fees. Directory inclusion is not independent confirmation of a 4PL partnership.`,
            shortDescription: `Source-published degree program listings in ${location} for ${batch}.`,
            image: precedingImages[0] || '', logo: precedingImages[1] || '',
          }, ['source']);
      }
      const degree = /^MBA/.test(name) ? 'MBA' : 'BBA';
      const specialization = name.split(' in ')[1] || '';
      const programSlug = `${uniSlug}-${slug(name)}`;
      const programData = {
        source: page.url, degreeLevel: degree === 'MBA' ? 'Postgraduate' : 'Undergraduate',
        specialization, duration, mode, batch, eligibility, fee, highlights,
        shortDescription: `${name} at ${university}, ${location}. ${duration}, ${mode.toLowerCase()}, ${batch} intake.`,
        description: `${name} is listed at ${university} in ${location} on the 4PL Academy ${degree === 'MBA' ? 'postgraduate' : 'undergraduate'} page for ${batch}. Its published highlights and entry requirements are shown below. Internship opportunities and placement assistance are support provisions, not guarantees of admission, employment or salary.`,
        feeNote: `Total course fee published for ${batch}; checked ${checked}. Confirm the current fee, inclusions and availability with the admissions team.`,
        projects: highlights.filter(h => /projects/i.test(h)),
        internships: highlights.filter(h => /internship/i.test(h)),
        industryExposure: highlights.filter(h => /visits|exposure|industry/i.test(h)),
        image: precedingImages[0] || '',
        ...(oldUniversity?.data.applicationUrl ? { applicationUrl: oldUniversity.data.applicationUrl } : {}),
        seoDescription: `${name} at ${university}: published eligibility, fees, duration and ${batch} intake information.`.slice(0, 155),
      };
      plan('programs', name, programSlug,
        { verified: true, location, degree, featured: true, universitySlug: uniSlug }, programData);
      institutionPrograms.push({ university, name, fee, source: page.url });
    }
  }
  assert.equal(institutionPrograms.length, 5);
  assert.equal(entries.filter(e => e.kind === 'courses').length, 12);

  const about = source.pages.find(p => p.url.endsWith('/about-us.php'));
  const aboutBody = about.markdown.slice(about.markdown.indexOf('## Who We Are'))
    .replace(/!\[[^\]]*\]\([^)]+\)\s*/g, '')
    .replace(/^### [🌍🎓]\s*/gmu, '## ')
    .replace(/^### /gm, '## ').trim();
  assert(aboutBody.includes('Our Vision') && aboutBody.includes('Our Mission'));
  const oldAbout = current.find(c => c.kind === 'pages' && c.slug === 'about');
  const previousBody = oldAbout?.data.description || '';
  const completeAboutBody = previousBody.includes('## Who We Are')
    ? previousBody
    : [aboutBody, previousBody && `## University Alliance program\n\n${previousBody}`].filter(Boolean).join('\n\n');
  plan('pages', 'About 4PL Academy', 'about', { verified: true }, {
    source: about.url, description: completeAboutBody,
    shortDescription: 'The education and training arm of 4PL Consultancy Ltd, developing industry-ready professionals through immersive, real-world learning.',
    seoDescription: 'Discover 4PL Academy, the education and training arm of 4PL Consultancy Ltd, and its vision, mission, expertise and practical learning approach.',
  }, ['description', 'shortDescription', 'seoDescription', 'source']);

  const workbookCoverage = workbook.map(row => {
    const match = current.find(c => c.kind === 'universities' && c.data.source === `Supplied Student Grad workbook, row ${row.sourceRow}`)
      || current.find(c => c.kind === 'universities' && slug(c.name) === slug(row.name) && slug(c.location || c.data.city || '') === slug(row.location || ''));
    return { row: row.sourceRow, institution: row.name, matchedSlug: match?.slug || null,
      linkedPrograms: match ? current.filter(c => c.kind === 'programs' && c.university_id === match.id).length : 0 };
  });
  assert(workbookCoverage.every(row => row.matchedSlug && row.linkedPrograms), 'Workbook directory coverage is incomplete');
  assertUnicode(entries);
  return { checked, entries, institutionPrograms, workbookCoverage, conflicts,
    excludedClaims: ['Unverified salary ranges and named employer/placement claims', 'Invalid workbook links and private coupon codes remain excluded from public catalog responses'],
    unchanged: 'Existing identifiers, slugs, generic degree listings, owner-edited fields, publishing controls and partnership verification are preserved.' };
}

if (process.argv[1]?.endsWith('prepare-official-content-import.mjs')) {
  const source = JSON.parse(fs.readFileSync('scripts/data/official-content-source.json', 'utf8'));
  const current = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const workbook = JSON.parse(fs.readFileSync('scripts/data/institutions.json', 'utf8'));
  const result = buildImportPlan(source, current, workbook);
  fs.writeFileSync(process.argv[3], JSON.stringify(result, null, 2));
  console.log(`Prepared ${result.entries.length} source-backed records; ${result.workbookCoverage.length} workbook rows already covered; ${result.conflicts.length} existing fields preserved.`);
}
