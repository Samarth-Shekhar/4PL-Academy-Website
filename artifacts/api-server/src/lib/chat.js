import { getCatalog } from './content.js';

export const unavailable = "I don't have verified information about that in the 4PL Academy database. Please contact the 4PL Academy team for more information.";
const deny = /ignore (?:all|previous)|system prompt|internal instructions|api.?key|password|(?:api|admin|login|database|private|authentication).?credentials?|secret|sql|database (?:dump|schema|structure)|delete|update.+database|execute|run.+command|guarantee|visa|immigration|legal advice|financial advice/i;
const stopwords = new Set('what which is are the a an at in of to for me please tell about do you have does and with can how programs program course courses university universities fee fees cost price eligibility eligible qualification percentage duration long take takes deadline batch start date much it its study studying'.split(' '));
for (const word of 'show explain give available approved information details curriculum module modules semester semesters learning outcomes outcome skills skill career careers pathway pathways role roles project projects internship internships industry exposure practical training admission admissions process certification certifications certificate certificates credentials credential issuer issued faq faqs questions contact phone telephone email address office where located your 4pl academy team'.split(' ')) stopwords.add(word);
const sourceOf = c => ({ name: c.name, url: c.kind === 'pages' ? `/${c.slug === 'career-industry' ? 'career' : c.slug}` : c.kind === 'faqs' ? '/faq' : c.kind === 'settings' ? '/contact' : c.kind === 'certifications' ? '/certifications' : `/${c.kind}/${c.slug}` });
const readable = value => {
  if (typeof value === 'string') return value.replace(/<[^>]*>/g, '').trim();
  if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? readable(v) : `${readable(v?.name)}${v?.modules?.length ? `: ${readable(v.modules)}` : ''}`).filter(Boolean).slice(0, 12).join('; ');
  return '';
};
const detailFields = {
  curriculum: ['curriculum', 'semesters'], modules: ['curriculum', 'semesters'],
  outcomes: ['outcomes'], careers: ['careerPaths'], projects: ['projects'],
  internships: ['internships'], industry: ['industryExposure'], admissions: ['admissionProcess'],
  certification: ['issuer', 'credentialType', 'duration', 'shortDescription'],
};
export function storedDetails(c, intent) {
  return (detailFields[intent] || []).map(k => readable(c[k])).filter(Boolean).join('\n').slice(0, 5000);
}
export async function answerQuestion(message) {
  if (deny.test(message)) return { answer: unavailable, sources: [] };
  const catalog = (await Promise.all(['programs','universities','courses','faqs','pages','certifications','blogs','settings'].map(kind => getCatalog(kind)))).flat();
  const tokens = message.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length > 1 && !stopwords.has(t));
  const intent = /scholarship|salary|package|placement (?:statistic|percentage|rate)|accreditation|refund|policy/i.test(message) ? 'restricted'
    : /fees?|cost|price/i.test(message) ? 'fee' : /eligible|eligibility|qualification|percentage/i.test(message) ? 'eligibility'
    : /duration|how long/i.test(message) ? 'duration' : /deadline|batch|start date/i.test(message) ? 'batch'
    : /curriculum|semesters?/i.test(message) ? 'curriculum' : /modules?/i.test(message) ? 'modules'
    : /career|roles?|pathways?/i.test(message) ? 'careers' : /learning outcomes?/i.test(message) ? 'outcomes'
    : /projects?/i.test(message) ? 'projects' : /internships?/i.test(message) ? 'internships'
    : /industry exposure/i.test(message) ? 'industry' : /admission process/i.test(message) ? 'admissions'
    : /certificat|credential|issuer/i.test(message) ? 'certification' : null;
  if (intent === 'restricted') return { answer: unavailable, sources: [] };
  if (/\bcontact|phone|telephone|email|address|office|where.*4pl\b/i.test(message) && (!tokens.length || tokens.every(t => /india|noida|sector|62/.test(t)))) {
    const offices = catalog.filter(c => c.kind === 'settings' && c.verified && c.slug === 'contact-india');
    if (!offices.length) return { answer: unavailable, sources: [] };
    return { answer: offices.map(c => [c.name,c.location,c.phone,c.email,c.website].map(readable).filter(Boolean).join('\n')).join('\n\n'), sources: offices.map(sourceOf) };
  }
  const filterKind = intent === 'certification' ? 'certifications' : /blogs?|articles?/i.test(message) ? 'blogs'
    : /professional|short.term|long.term|trade compliance|incoterms|customs/i.test(message) ? 'courses'
    : /universit|colleges|institutions/i.test(message) && !/bba|mba|pgdm|btech|b\.tech|bca|degree/i.test(message) ? 'universities'
    : /bba|mba|pgdm|btech|b\.tech|bca|degree|undergraduate|postgraduate|programs/i.test(message) ? 'programs' : null;
  let available = catalog.filter(c => c.verified && c.kind !== 'settings' && (!filterKind || c.kind === filterKind));
  // Never attach a generic degree's facts to an unknown or unrelated institution.
  const institutionPhrase=message.match(/\b(?:at|from)\s+([^?!.]+)/i)?.[1]?.toLowerCase().trim();
  if(intent && institutionPhrase && !/^4pl academy$/i.test(institutionPhrase)) {
    const institution=catalog.find(c=>c.kind==='universities' && (c.name.toLowerCase()===institutionPhrase || institutionPhrase.includes(c.name.toLowerCase())));
    if(!institution)return {answer:unavailable,sources:[]};
    available=available.filter(c=>c.universityId===institution.id || c.kind==='universities'&&c.id===institution.id);
  }
  const ranked = available.map(c => {
    const text = `${c.name} ${c.location} ${c.degree || ''} ${c.description || ''}`.toLowerCase();
    return { item: c, score: tokens.reduce((sum, t) => sum + (c.name.toLowerCase().includes(t) ? 4 : text.includes(t) ? 1 : 0), 0) };
  }).filter(r => r.score > 0).sort((a,b) => b.score - a.score);
  if (!ranked.length && !intent && filterKind && available.length && /available|explore|programs|universities|courses/.test(message.toLowerCase())) {
    return { answer: `You can explore these ${filterKind} in our approved directory: ${available.slice(0,6).map(c => c.name).join(', ')}. Institution directory entries do not confirm a 4PL partnership. Fees and admissions details must be verified with the admissions team.`, sources: available.slice(0,6).map(c => ({ name: c.name, url: `/${c.kind}/${c.slug}` })) };
  }
  if (!ranked.length) return { answer: unavailable, sources: [] };
  const matches = ranked.filter(r => r.score >= ranked[0].score).slice(0,4).map(r => r.item);
  if (intent) {
    if (matches.length !== 1) return { answer: unavailable, sources: matches.map(sourceOf) };
    const c = matches[0];
    const identity=`${c.name} ${c.location} ${c.degree||''}`.toLowerCase();
    if (detailFields[intent]) {
      const detail = storedDetails(c, intent);
      if (tokens.some(t => !identity.includes(t)) || !detail) return { answer: unavailable, sources: [sourceOf(c)] };
      return { answer: `${c.name} — ${intent}:\n${detail}\n\nThis describes approved educational information, not a guarantee of admission or employment.`, sources: [sourceOf(c)] };
    }
    if (tokens.some(t=>!identity.includes(t)) || !c.verified || !c[intent]) return { answer: unavailable, sources: [{ name: c.name, url:`/${c.kind}/${c.slug}` }] };
    return { answer: `${c.name} — ${intent}: ${c[intent]}.${intent === 'fee' && c.feeNote ? ` ${c.feeNote}` : ''}`, sources: [{ name:c.name,url:`/${c.kind}/${c.slug}` }] };
  }
  return { answer: matches.map(c => `${c.name}${c.location ? ' — '+c.location : ''}. ${c.shortDescription || c.description || 'Further details are to be verified with our admissions team.'}`).join('\n\n'), sources: matches.map(c => ({name:c.name,url:c.kind === 'pages' ? `/${c.slug}` : c.kind === 'faqs' ? '/faq' : `/${c.kind}/${c.slug}`})) };
}
