import { db, contentTable } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { siteUrl } from './config.js';
const escape = value => String(value || '').replace(/[<>&"']/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
const fixedRoutes = ['','programs','programs/undergraduate','programs/postgraduate','universities','professional-courses','professional-courses/short-term','professional-courses/long-term','certifications','about','career-industry','student-life','for-universities','blogs','faq','contact','apply','counselling'];
const canonicalPath = pathname => pathname.replace(/^\/courses(?=\/|$)/,'/professional-courses').replace(/^\/blog(?=\/)/,'/blogs');
export async function sitemap() {
  if (!siteUrl) return null;
  const rows = await db.select().from(contentTable).where(eq(contentTable.status,'published'));
  const dynamic = rows.filter(r=>['universities','programs','courses','blogs'].includes(r.kind)).map(r=>({path:`${r.kind==='courses'?'professional-courses':r.kind}/${r.slug}`,updated:r.updatedAt.toISOString()}));
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...fixedRoutes.map(path=>({path})),...dynamic].map(r=>`<url><loc>${escape(siteUrl+'/'+r.path)}</loc>${r.updated?`<lastmod>${r.updated}</lastmod>`:''}</url>`).join('')}</urlset>`;
}
export function robots() {
  return `User-agent: *\nDisallow: /admin\nDisallow: /api\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : '# SITE_URL must be configured before generating a canonical sitemap.\n'}`;
}
export async function renderMetadata(html, pathname) {
  let title = '4PL Academy | Creating Global Professionals';
  let description = 'Industry-integrated education connecting students, universities and careers. Explore degree programs, professional courses and admissions support.';
  let robotsTag = 'index, follow';
  let image = '';
  let ogTitle = '';
  let ogDescription = '';
  let canonical = siteUrl ? siteUrl + canonicalPath(pathname) : '';
  const parts = canonicalPath(pathname).split('/').filter(Boolean);
  if (parts[0] === 'admin') robotsTag = 'noindex, nofollow';
  const collection = parts[0] === 'professional-courses' ? 'courses' : parts[0];
  const kind = ['universities','programs','courses','blogs'].includes(collection) && parts[1] ? collection : 'pages';
  const slug = kind === 'pages' ? (parts[0] || 'home') : parts[1];
  const [row] = await db.select().from(contentTable).where(and(eq(contentTable.slug,slug),eq(contentTable.kind,kind))).limit(1);
  if (row?.status === 'published' && row.kind === kind) {
    title = row.data.seoTitle || `${row.name} | 4PL Academy`;
    description = row.data.seoDescription || row.data.shortDescription || row.data.description || description;
    canonical = row.data.canonical || canonical;
    image = row.data.ogImage || '';
    ogTitle = row.data.ogTitle || '';
    ogDescription = row.data.ogDescription || '';
    robotsTag = row.data.robots || robotsTag;
  } else if (parts.length) title = `${parts[0].replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} | 4PL Academy`;
  const [override]=await db.select().from(contentTable).where(and(eq(contentTable.kind,'seo'),eq(contentTable.slug,parts.join('-')||'home'),eq(contentTable.status,'published'))).limit(1);
  if(override) {
    const value=override.data;
    title=value.seoTitle||title;
    description=value.seoDescription||description;
    canonical=value.canonical||canonical;
    image=value.ogImage||image;
    ogTitle=value.ogTitle||ogTitle;
    ogDescription=value.ogDescription||ogDescription;
    if(parts[0]!=='admin')robotsTag=value.robots||robotsTag;
  }
  const structured = [];
  if (pathname === '/') structured.push({'@context':'https://schema.org','@type':'EducationalOrganization',name:'4PL Academy',description:'The learning arm of 4PL Consultancy Ltd.',...(siteUrl?{url:siteUrl}:{})});
  if (row?.status === 'published' && row.verified && ['programs','courses'].includes(row.kind)) structured.push({'@context':'https://schema.org','@type':'Course',name:row.name,description:row.data.shortDescription||row.data.description||'',provider:{'@type':'Organization',name:'4PL Academy'}});
  if (row?.status === 'published' && row.verified && row.kind === 'universities') structured.push({'@context':'https://schema.org','@type':'EducationalOrganization',name:row.name,description:row.data.shortDescription||row.data.description||'',...(row.data.websiteUrl?{url:row.data.websiteUrl}:{})});
  if (row?.status === 'published' && row.kind === 'blogs') structured.push({'@context':'https://schema.org','@type':'Article',headline:row.name,description:row.data.shortDescription||'',...(row.data.publishedAt?{datePublished:row.data.publishedAt}:{}),...(row.data.author?{author:{'@type':'Person',name:row.data.author}}:{})});
  if (pathname === '/faq') {
    const faqs = await db.select().from(contentTable).where(and(eq(contentTable.kind,'faqs'),eq(contentTable.status,'published'),eq(contentTable.verified,true)));
    structured.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(f=>({'@type':'Question',name:f.name,acceptedAnswer:{'@type':'Answer',text:f.data.description||''}}))});
  }
  if (row?.status === 'published' && row.verified && row.data.faqs?.length) structured.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:row.data.faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))});
  if (siteUrl && parts.length && parts[0] !== 'admin') structured.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl},...parts.map((part,i)=>({'@type':'ListItem',position:i+2,name:i===parts.length-1&&row?.status==='published'?row.name:part.replace(/-/g,' '),item:siteUrl+'/'+parts.slice(0,i+1).join('/')}))]});
  const tags = `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${escape(robotsTag)}"><meta property="og:title" content="${escape(ogTitle||title)}"><meta property="og:description" content="${escape(ogDescription||description)}"><meta property="og:type" content="${row?.kind==='blogs'?'article':'website'}"><meta name="twitter:card" content="summary_large_image">${canonical?`<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">`:''}${image?`<meta property="og:image" content="${escape(image)}">`:''}${structured.map(data=>`<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`).join('')}`;
  return html.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\s+(?:name|property)=["'](?:description|robots|og:[^"']*)["'][^>]*>/gi,'').replace('</head>',tags+'</head>');
}
