import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RichText } from '@/components/RichText';
import { has, asset } from '@/lib/format';

/* Split Markdown at # / ## headings. Nothing is dropped: text before the first
   heading becomes the intro, every other line stays in its section body. */
export function splitMarkdown(text) {
  if (!has(text)) return { intro: '', sections: [] };
  const out = { intro: [], sections: [] };
  let cur = null; let fence = false;
  for (const line of String(text).replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && line.match(/^#{1,2}\s+(.+?)\s*#*\s*$/);
    if (m) { cur = { title: m[1], lines: [] }; out.sections.push(cur); } else (cur ? cur.lines : out.intro).push(line);
  }
  return {
    intro: out.intro.join('\n').trim(),
    sections: out.sections.map((s, i) => ({ id: `about-${i}-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`, title: s.title, body: s.lines.join('\n').trim() })),
  };
}

function Row({ s, i, photo, reduce }) {
  const fade = reduce ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } };
  const columns = !photo ? '' : i % 2
    ? 'md:grid-cols-[17rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[20rem_minmax(0,1fr)]'
    : 'md:grid-cols-[minmax(0,1fr)_17rem] md:gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]';
  return (
    <motion.section id={s.id} data-testid={`about-section-${i}`} {...fade} className="scroll-mt-28 border-t border-navy/10 py-9 first:border-t-0 sm:py-12">
      <div className={`grid min-w-0 gap-6 ${columns}`}>
        <div className="min-w-0">
          <h2 className="break-words text-2xl font-extrabold text-navy sm:text-3xl">{s.title}</h2>
          <div className="gold-rule mb-5 mt-3" />
          <RichText text={s.body} />
        </div>
        {photo && (
          <motion.figure {...(reduce ? {} : { initial: { opacity: 0, scale: 0.97, x: i % 2 ? -16 : 16 }, whileInView: { opacity: 1, scale: 1, x: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 } })} className={`group self-start overflow-hidden rounded-xl bg-mist ${i % 2 ? 'md:order-first' : ''}`}>
            <img src={photo.src} alt={photo.alt || ''} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          </motion.figure>
        )}
      </div>
    </motion.section>
  );
}

export function AboutSections({ text, photos = [], extra = [] }) {
  const reduce = useReducedMotion();
  const { intro, sections } = useMemo(() => splitMarkdown(text), [text]);
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: '-15% 0px -65% 0px' });
    sections.forEach((s) => { const n = document.getElementById(s.id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, [sections]);
  if (!sections.length) return <RichText text={text} />;
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', `#${id}`); setActive(id); };
  const industry = { src: asset('images/industry-logistics.webp'), alt: '' };
  const seen = new Set();
  const pool = [industry, ...photos, ...extra.slice(0, 2)].filter((x) => x.src && !seen.has(x.src) && seen.add(x.src));
  const len = sections.length;
  const slots = new Map();
  pool.forEach((ph, k) => { let idx = Math.min(len - 1, Math.round((k * len) / pool.length)); while (slots.has(idx) && idx < len - 1) idx += 1; if (!slots.has(idx)) slots.set(idx, ph); });
  return (
    <div data-testid="about-sections">
      {has(intro) && <div className="pb-6 text-lg"><RichText text={intro} /></div>}
      <nav aria-label="About sections" data-testid="about-nav" className="mb-6 border-y border-navy/10 bg-mist/60 px-3 py-3 sm:px-4">
        <ul className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <li key={s.id} className="max-w-full">
              <button type="button" onClick={() => go(s.id)} aria-current={active === s.id ? 'true' : undefined} className={`max-w-full whitespace-normal break-words rounded-full border px-3.5 py-1.5 text-left text-sm font-semibold leading-snug transition-colors ${active === s.id ? 'border-gold bg-gold text-navy' : 'border-navy/20 bg-white text-navy hover:border-gold hover:bg-gold/15'}`}>{s.title}</button>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        {sections.map((s, i) => <Row key={s.id} s={s} i={i} photo={slots.get(i) || null} reduce={reduce} />)}
      </div>
    </div>
  );
}
