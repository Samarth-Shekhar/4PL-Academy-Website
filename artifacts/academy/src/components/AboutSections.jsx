import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RichText } from '@/components/RichText';
import { has } from '@/lib/format';

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
  const flip = i % 2 === 1;
  const fade = reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } };
  return (
    <motion.section id={s.id} data-testid={`about-section-${i}`} {...fade} className="scroll-mt-36 border-t border-navy/10 py-12 sm:py-16">
      <div className="grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className={`min-w-0 lg:col-span-4 ${flip ? 'lg:order-2' : ''}`}>
          <span className="num-xl text-4xl text-gold-deep" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <h2 className="mt-2 break-words text-2xl font-extrabold text-navy sm:text-3xl">{s.title}</h2>
          <div className="gold-rule mt-4" />
          {photo && (
            <figure className="mt-6 overflow-hidden rounded-2xl bg-mist">
              <img src={photo.src} alt={photo.alt || 'Student life photograph from the 4PL Academy media catalog'} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
            </figure>
          )}
        </div>
        <div className={`min-w-0 lg:col-span-8 ${flip ? 'lg:order-1' : ''}`}><RichText text={s.body} /></div>
      </div>
    </motion.section>
  );
}

export function AboutSections({ text, photos = [] }) {
  const reduce = useReducedMotion();
  const { intro, sections } = useMemo(() => splitMarkdown(text), [text]);
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: '-20% 0px -60% 0px' });
    sections.forEach((s) => { const n = document.getElementById(s.id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, [sections]);
  if (!sections.length) return <RichText text={text} />;
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', `#${id}`); };
  let n = 0;
  const lead = photos[0];
  return (
    <div data-testid="about-sections">
      <div className={`grid gap-8 pb-10 ${has(intro) && lead ? 'lg:grid-cols-2 lg:items-center' : ''}`}>
        {has(intro) && <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-lg"><RichText text={intro} /></motion.div>}
        {lead && <motion.img initial={reduce ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} src={lead.src} alt={lead.alt || 'Student life photograph from the 4PL Academy media catalog'} className="aspect-[16/10] w-full rounded-3xl object-cover" />}
      </div>
      <nav aria-label="About sections" className="sticky top-[4.75rem] z-10 -mx-4 border-y border-navy/10 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {sections.map((s) => <button key={s.id} type="button" onClick={() => go(s.id)} aria-current={active === s.id ? 'true' : undefined} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${active === s.id ? 'border-gold bg-gold text-navy' : 'border-navy/20 text-navy hover:border-gold hover:bg-gold/15'}`}>{s.title}</button>)}
        </div>
      </nav>
      <div>
        {sections.map((s, i) => {
          const photo = i % 3 === 1 && photos.length > 1 ? photos[1 + (n++ % (photos.length - 1))] : null;
          return <Row key={s.id} s={s} i={i} photo={photo} reduce={reduce} />;
        })}
      </div>
    </div>
  );
}
