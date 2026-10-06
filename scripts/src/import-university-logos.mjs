// Download branding referenced by official institution websites.
// This prepares assets and a review manifest; it never changes CMS records.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const sources = [
  [[1], 'Accurate Institute', 'https://www.accurate.in/'],
  [[3], 'I Business Institute', 'https://www.ibusinessinstitute.org/'],
  [[5], 'GNIOT', 'https://www.gniotgroup.edu.in/'],
  [[7], 'K R Mangalam', 'https://www.krmangalam.edu.in/'],
  [[10], 'FIIB', 'https://www.fiib.edu.in/'],
  [[12], 'IMM', 'https://www.immindia.edu.in/'],
  [[14, 67], 'GN Group', 'https://www.gngroup.org/'],
  [[16], 'IILM', 'https://iilm.edu/greater-noida'],
  [[18], 'JK Business School', 'https://jkbschool.org/'],
  [[21, 89], 'IIBS', 'https://www.iibs.edu.in/'],
  [[23], 'Fostima', 'https://www.fostiima.org/'],
  [[25], 'NDIM', 'https://www.ndimdelhi.org/'],
  [[27, 30], 'GD Goenka University', 'https://www.gdgoenkauniversity.com/'],
  [[33], 'Noida International University', 'https://niu.edu.in/'],
  [[35], 'Bennett University', 'https://www.bennett.edu.in/'],
  [[38], 'JIMS', 'https://www.jimsgn.org/'],
  [[40], 'SOIL', 'https://www.soil.edu.in/'],
  [[42], 'Sparsh', 'https://www.sparshgbs.in/'],
  [[44], 'St Andrews', 'https://saitm.ac.in/'],
  [[47], 'Jaipuria Ghaziabad', 'https://jsb.jaipuria.edu.in/'],
  [[49], 'SGT University', 'https://sgtuniversity.ac.in/'],
  [[52], 'Apeejay Stya University', 'https://university.apeejay.edu/'],
  [[55], 'Mangalmay', 'https://www.mangalmay.org/'],
  [[58], 'Sushant University', 'https://sushantuniversity.edu.in/'],
  [[61], 'Lalita Devi', 'https://lldims.edu.in/'],
  [[64], 'NDIM undergraduate', 'https://www.ndimdelhi.in/'],
  [[70], 'RIIM', 'https://www.riimpune.com/'],
  [[72], 'Lexicon MILE', 'https://www.lexiconmile.com/'],
  [[74], 'ISMS', 'https://ismspune.in/'],
  [[76], 'Indus IIEBM', 'https://www.iiebm.com/'],
  [[78], 'PCU', 'https://pcu.edu.in/'],
  [[81], 'Universal AI', 'https://www.universalai.in/'],
  [[84], 'ATLAS SkillTech', 'https://atlasuniversity.edu.in/'],
  [[87], 'Pune Business School', 'https://punebusinessschool.com/'],
  [[91], 'GIBS', 'https://www.gibs.edu.in/'],
  [[93], 'RIT Roorkee', 'https://ritroorkee.com/'],
  [[95], 'UPES', 'https://www.upes.ac.in/'],
  [[98], 'Graphic Era', 'https://geu.ac.in/'],
  [[101], 'DBS', 'https://www.doonbusinessschool.com/'],
  [[104], 'Dev Bhoomi', 'https://www.dbuu.ac.in/'],
  [[107], 'Emversity', 'https://emversity.com/'],
  [[110], 'Intellipaat', 'https://intellipaat.com/'],
  [[112], 'NIAT', 'https://www.niatindia.com/'],
  [[114], 'upGrad', 'https://www.upgrad.com/'],
  [[815], 'Vivekananda Global University', 'https://vgu.ac.in/'],
  [[816], 'IBMR', 'https://ibmrbschool.com/'],
];
const outDir = 'artifacts/academy/public/images/university-logos';
const manifestPath = 'scripts/src/university-logo-sources.json';
await fs.mkdir(outDir, { recursive: true });
const results = [];
const failures = [];
const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => '{"results":[]}'));
const get = async url => {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(14000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcademyBrandAssetImport/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
};
const decode = s => s.replace(/&amp;/g, '&').replace(/&#x2f;/gi, '/').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
function candidates(html, base, name) {
  const strong = name.toLowerCase().split(/\W+/).filter(t => t.length > 2 && !/^(university|business|school|group|institute|international|noida|global|delhi|undergraduate)$/.test(t));
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((m, i) => {
    const tag = m[0];
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']+)["']/g)].map(a => [a[1].toLowerCase(), decode(a[2])]));
    const raw = attrs['data-src'] || attrs['data-lazy-src'] || attrs.src;
    if (!raw || !/logo|brand|wordmark/i.test(tag) || /recruit|placement|partner|aicte|naac|ugc|whatsapp|facebook|google|award|nirf/i.test(tag)) return null;
    const url = new URL(raw, base).href;
    if (!/^https?:\/\//.test(url)) return null;
    const score = 80 - Math.min(i, 70) + strong.filter(t => tag.toLowerCase().includes(t)).length * 30
      + (/header|main-logo|custom-logo|site-logo|navbar/i.test(tag) ? 30 : 0)
      - (/white|light-logo|logo-light/i.test(tag) ? 65 : 0);
    return { url, score, alt: attrs.alt || '' };
  }).filter(Boolean).sort((a, b) => b.score - a.score).filter((c, i, all) => all.findIndex(x => x.url === c.url) === i).slice(0, 5);
}
async function download(item) {
  const [ids, name, website] = item;
  try {
    const reviewed = previous.results.find(r => r.reviewed && r.ids.includes(ids[0]));
    if (reviewed) {
      await fs.access(`artifacts/academy/public${reviewed.logo}`);
      results.push(reviewed);
      return;
    }
    const page = await get(website);
    const html = await page.text();
    const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
    const urls = candidates(html, page.url, name);
    if (name === 'Sushant University') urls.unshift({ url: 'https://sushantuniversity.edu.in/front-assets/images/Su-Logo-sh.png' });
    let lastError = 'No official logo image found';
    for (const c of urls) {
      try {
        const res = await get(c.url);
        const bytes = Buffer.from(await res.arrayBuffer());
        const type = res.headers.get('content-type') || '';
        if (!type.includes('image') && !bytes.toString('utf8', 0, 300).includes('<svg')) throw new Error('Not an image');
        const ext = type.includes('svg') ? 'svg' : type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('avif') ? 'avif' : 'jpg';
        const temp = `/tmp/academy-university-logo-${ids[0]}.${ext}`;
        await fs.writeFile(temp, bytes);
        const dimensions = execFileSync('identify', ['-format', '%w %h', temp], { timeout: 15000 }).toString().trim().split(' ').map(Number);
        if (dimensions.some(n => n < 12)) throw new Error('Image is too small');
        const filename = `${ids[0]}.webp`;
        execFileSync('convert', [temp, '-trim', '+repage', '-resize', '800x320>', '-quality', '92', path.join(outDir, filename)], { timeout: 20000, stdio: 'pipe' });
        const record = { ids, name, website: page.url, pageTitle: title, sourceUrl: c.url, logo: `/images/university-logos/${filename}` };
        results.push(record);
        console.log(`OK ${ids.join(',')} ${name}: ${c.url}`);
        return;
      } catch (err) { lastError = err.message; }
    }
    throw new Error(lastError);
  } catch (err) { failures.push({ ids, name, website, error: err.message }); console.log(`MISSING ${name}: ${err.message}`); }
}
let next = 0;
await Promise.all(Array.from({ length: 7 }, async () => {
  while (next < sources.length) await download(sources[next++]);
}));
results.push({ ids: [116], name: '4PL', website: 'https://4placademy.com/', sourceUrl: 'Existing owner-provided academy brand logo', logo: '/images/4pl-logo-trimmed.webp' });
results.sort((a, b) => a.ids[0] - b.ids[0]);
await fs.writeFile(manifestPath, JSON.stringify({ note: 'Reviewed original brand assets, not evidence of an academic partnership.', results, failures }, null, 2) + '\n');
console.log(`Prepared logos for ${results.reduce((n, r) => n + r.ids.length, 0)} of 50 directory records; ${failures.length} sites need review.`);
