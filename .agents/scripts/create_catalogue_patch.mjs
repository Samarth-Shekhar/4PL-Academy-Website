import { writeFile } from 'node:fs/promises';
import { programmes } from '../data/programme-catalogue.mjs';
import { sitePatches, aboutAppendix, img, source } from '../data/catalogue-site-content.mjs';

const fetchJson = async path => {
  const res = await fetch(`http://localhost:8080/api/catalog/${path}`);
  if (!res.ok) throw new Error(`Cannot read ${path}: ${res.status}`);
  return res.json();
};
const pages = await fetchJson('pages');
const about = pages.find(p => p.slug === 'about');
if (!about?.description) throw new Error('Existing About content is missing.');
let body = about.description.split('\n\n## Our Schools & Programmes')[0];
body = body.replace(/4PL Academy is the education and training arm[^]*?through immersive, real-world learning\./, '4PL Academy Ltd is the learning and development arm of 4PL Consultancy, with UK roots and a global outlook. We develop technology-enabled, industry-ready professionals through academic learning, AI and emerging technologies, practical industry experience and international opportunities.');
body = body.replace(/## Our Vision\n[^]*?(?=\n## Our Mission)/, '## Our Vision\n\nTo develop technology-enabled, industry-ready and internationally minded professionals capable of succeeding in the rapidly changing global economy.\n');
body = body.replace(/## Our Mission\n[^]*?(?=\n## Why 4PL Consultancy)/, '## Our Mission\n\nTo bridge the gap between university education and the modern workplace by integrating academic programmes with AI, emerging technologies, professional learning, practical industry experience and global opportunities.\n');
body = body.replace(/Its Admission–Training–Placement model[^]*?career support\./, 'Its industry-integrated approach connects academic study with the IIAP™ learning model, technology exposure, practical projects and career development.');
const visuals = [
  ['who we are', 'academy-global'], ['operating across borders', 'academy-london'],
  ['our schools & programmes', 'bba-ai'], ['industry integrated academic programme', 'academy-global'],
  ['enterprise technology kit', 'btech-ai'], ['4pl professional passport', 'mba-ai'],
  ['innovation & entrepreneurship', 'bca-ai'], ['global industry & academic exposure', 'bba-trade'],
];
sitePatches.push({ kind: 'pages', slug: 'about', data: {
  source, description: body + aboutAppendix, image: img('academy-global'),
  shortDescription: 'UK roots. Global outlook. Industry-integrated AI, business, computing, engineering and trade programmes that connect academic learning with practical capability.',
  items: visuals.map(([name, key]) => ({ name, image: img(key), altText: 'Programme artwork from the owner-supplied 4PL Academy brochures', imageSourceType: 'owner-supplied-brochure-artwork' })),
}});
const partner = pages.find(p => p.slug === 'for-universities');
if (partner) sitePatches.push({ kind: 'pages', slug: partner.slug, data: {
  source, image: img('mba-ai'), description: partner.description.replace(/\n\n## IIAP Collaboration[^]*$/, '') + '\n\n## IIAP Collaboration\n\nConnect academic delivery with Learn, Apply, Experience, Innovate and Lead. Explore programme-specific Enterprise Technology Kits, industry projects, expert mentoring, innovation labs, the Startup Challenge and Professional Passport™ portfolios. The academic curriculum and degree requirements remain governed by the awarding/partner university.\n\n## Future-Focused Schools\n\nDiscuss collaboration across Artificial Intelligence & Business; Intelligent Computing; Engineering & Emerging Technologies; and Global Trade, Logistics & Supply Chain. Professional certification and optional international exposure pathways depend on the relevant approvals, providers and programme arrangements.',
}});
const employer = pages.find(p => p.slug === 'careers');
if (employer) sitePatches.push({ kind: 'pages', slug: 'careers', data: {
  source, description: employer.description.replace('degree pathways and professional courses in logistics and supply chain, artificial intelligence and digital marketing', 'industry-integrated learning in AI business, intelligent computing, cloud engineering, cybersecurity, DevOps and global trade'),
}});
await writeFile('/tmp/academy-catalogue-update.json', JSON.stringify({
  programmes: programmes.map(({ file, supplementaryFile, key, kind, status, featured, sortOrder, name, slug, degree, category, ...data }) => ({ kind, status, featured, sortOrder, name, slug, degree, category, data })),
  patches: sitePatches,
}));
console.log(`Prepared ${programmes.length} programme records and ${sitePatches.length} page/homepage patches.`);
