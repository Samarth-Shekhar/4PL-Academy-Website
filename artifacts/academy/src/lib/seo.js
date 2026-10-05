import { useEffect } from 'react';
import { asset } from './format';
import { usePublicList } from './api';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}
export function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}
export function useSeo({ title, description, image, canonical, noindex, robots, ogTitle, ogDescription, type = 'website', jsonLd }) {
  const overrides=usePublicList('seo').data||[];
  const pathKey=window.location.pathname.split('/').filter(Boolean).join('-')||'home';
  const override=overrides.find(record=>record.slug===pathKey);
  if(override) {
    title=override.seoTitle||title;description=override.seoDescription||description;
    image=override.ogImage||image;canonical=override.canonical||canonical;
    robots=override.robots||robots;ogTitle=override.ogTitle||ogTitle;ogDescription=override.ogDescription||ogDescription;
  }
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const full = title ? (title.includes('4PL Academy') ? title : `${title} | 4PL Academy`) : '4PL Academy | Creating Global Professionals';
    document.title = full;
    const desc = description || 'Industry-integrated education built for real-world careers. 4PL Academy bridges universities and industry.';
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : robots || 'index, follow');
    setMeta('property', 'og:title', ogTitle || full);
    setMeta('property', 'og:description', ogDescription || desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonical || window.location.href.split('#')[0]);
    setMeta('property', 'og:image', new URL(image || asset('images/hero-students.webp'), window.location.origin).href);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', ogTitle || full);
    setMeta('name', 'twitter:description', ogDescription || desc);
    setLink('canonical', canonical || window.location.href.split('#')[0].split('?')[0]);
    setJsonLd('ld-page', ld ? JSON.parse(ld) : null);
  }, [title, description, image, canonical, noindex, robots, ogTitle, ogDescription, type, ld]);
}
export const seoFrom = (c, fb = {}) => ({
  title: c?.seoTitle || c?.name || fb.title,
  description: c?.seoDescription || c?.shortDescription || fb.description,
  image: c?.ogImage || c?.image || fb.image,
  canonical: c?.canonical || undefined,
  robots: c?.robots || undefined,
  ogTitle: c?.ogTitle || undefined,
  ogDescription: c?.ogDescription || undefined,
});
