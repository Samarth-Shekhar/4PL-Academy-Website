import { getCatalog } from './content.js';

const unavailable = "I don't have verified information about that in the 4PL Academy database. I can help you explore available programs or connect you with the admissions team.";
const deny = /ignore (?:all|previous)|system prompt|api.?key|password|credential|secret|sql|database dump|delete|update.+database|guarantee|visa|legal advice|financial advice/i;
const stopwords = new Set('what which is are the a an at in of to for me please tell about do you have does and with can how programs program course courses university universities fee fees cost price eligibility eligible qualification percentage duration long take takes deadline batch start date much it its study studying'.split(' '));
export async function answerQuestion(message) {
  if (deny.test(message)) return { answer: unavailable, sources: [] };
  const catalog = (await Promise.all(['programs','universities','courses','faqs','pages'].map(kind => getCatalog(kind)))).flat();
  const tokens = message.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length > 1 && !stopwords.has(t));
  const intent = /fees?|cost|price/i.test(message) ? 'fee' : /eligible|eligibility|qualification|percentage/i.test(message) ? 'eligibility' : /duration|how long/i.test(message) ? 'duration' : /deadline|batch|start date/i.test(message) ? 'batch' : /scholarship|salary|package|placement statistic|accreditation|refund|policy/i.test(message) ? 'restricted' : null;
  if (intent === 'restricted') return { answer: unavailable, sources: [] };
  const filterKind = /professional|short.term|long.term|trade compliance|incoterms|customs/i.test(message) ? 'courses'
    : /universit|colleges|institutions/i.test(message) && !/bba|mba|pgdm|btech|b\.tech|bca|degree/i.test(message) ? 'universities'
    : /bba|mba|pgdm|btech|b\.tech|bca|degree|undergraduate|postgraduate|programs/i.test(message) ? 'programs' : null;
  let available = catalog.filter(c => c.verified && (!filterKind || c.kind === filterKind));
  // Never attach a generic degree's facts to an unknown or unrelated institution.
  const institutionPhrase=message.match(/\b(?:at|from)\s+([^?!.]+)/i)?.[1]?.toLowerCase().trim();
  if(intent && institutionPhrase) {
    const institution=catalog.find(c=>c.kind==='universities' && (c.name.toLowerCase()===institutionPhrase || institutionPhrase.includes(c.name.toLowerCase())));
    if(!institution)return {answer:unavailable,sources:[]};
    available=available.filter(c=>c.universityId===institution.id || c.kind==='universities'&&c.id===institution.id);
  }
  const ranked = available.map(c => {
    const text = `${c.name} ${c.location} ${c.degree || ''} ${c.description || ''}`.toLowerCase();
    return { item: c, score: tokens.reduce((sum, t) => sum + (c.name.toLowerCase().includes(t) ? 4 : text.includes(t) ? 1 : 0), 0) };
  }).filter(r => r.score > 0).sort((a,b) => b.score - a.score);
  if (!ranked.length && !intent && filterKind && /available|explore|programs|universities|courses/.test(message.toLowerCase())) {
    return { answer: `You can explore these ${filterKind} in our approved directory: ${available.slice(0,6).map(c => c.name).join(', ')}. Institution directory entries do not confirm a 4PL partnership. Fees and admissions details must be verified with the admissions team.`, sources: available.slice(0,6).map(c => ({ name: c.name, url: `/${c.kind}/${c.slug}` })) };
  }
  if (!ranked.length) return { answer: unavailable, sources: [] };
  const matches = ranked.filter(r => r.score >= ranked[0].score).slice(0,4).map(r => r.item);
  if (intent) {
    if (matches.length !== 1) return { answer: 'Please specify the exact university and program so I can check its approved information. '+unavailable, sources: matches.map(c => ({ name:c.name,url:`/${c.kind}/${c.slug}` })) };
    const c = matches[0];
    const identity=`${c.name} ${c.location} ${c.degree||''}`.toLowerCase();
    if (tokens.some(t=>!identity.includes(t)) || !c.verified || !c[intent]) return { answer: unavailable, sources: [{ name: c.name, url:`/${c.kind}/${c.slug}` }] };
    return { answer: `${c.name} — ${intent}: ${c[intent]}.${intent === 'fee' && c.feeNote ? ` ${c.feeNote}` : ''}`, sources: [{ name:c.name,url:`/${c.kind}/${c.slug}` }] };
  }
  return { answer: matches.map(c => `${c.name}${c.location ? ' — '+c.location : ''}. ${c.shortDescription || c.description || 'Further details are to be verified with our admissions team.'}`).join('\n\n'), sources: matches.map(c => ({name:c.name,url:c.kind === 'pages' ? `/${c.slug}` : c.kind === 'faqs' ? '/faq' : `/${c.kind}/${c.slug}`})) };
}
