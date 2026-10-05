import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { bySection, useMatch, useMedia } from '@/lib/home';
import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pic, Illustrative } from './shared';
import { Link } from 'wouter';

function Story({ it, i }) {
  return (
    <article className="relative aspect-[4/5] w-[min(82vw,26rem)] shrink-0 overflow-hidden rounded-lg bg-navy sm:w-[26rem] lg:aspect-[3/4] lg:w-[27rem]">
      <Pic src={it.image} alt={it.altText || ''} label={it.name} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <span className="font-display text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
        <h3 className="mt-1 text-2xl leading-tight text-surface sm:text-3xl">{it.name}</h3>
        {has(it.description) && <p className="mt-2 text-sm leading-relaxed text-surface/80">{it.description}</p>}
        {has(it.url) && it.url !== 'bot' && <Link href={it.url} className="mt-3 inline-block text-sm font-bold text-gold underline-offset-4 hover:underline">Read more</Link>}
      </div>
    </article>
  );
}

export function PracticalLearning({ s }) {
  const { list } = useMedia();
  const reduce = useReducedMotion();
  const wide = useMatch('(min-width: 1024px)');
  const ref = useRef(null); const track = useRef(null);
  const [dist, setDist] = useState(0);
  const extra = bySection(list, 'practical').filter((m) => m.type === 'image').map((m) => ({ name: m.name, description: m.caption, image: m.url, altText: m.altText }));
  const items = [...(s.items || []), ...extra];
  const sticky = wide && !reduce && items.length > 2;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  useEffect(() => { const m = () => { if (track.current) setDist(Math.max(track.current.scrollWidth - window.innerWidth + 96, 0)); }; m(); window.addEventListener('resize', m); return () => window.removeEventListener('resize', m); }, [items.length, sticky]);
  const head = <div id="sec-practical" className="container-x"><Head s={s} light /><Body s={s} light /><CtaRow s={s} light className="mt-6" /></div>;
  return (
    <section ref={ref} className="navy-surface on-navy" style={sticky ? { height: `${Math.max(dist, 600) + 640}px` } : undefined} aria-labelledby="sec-practical">
      {sticky ? (
        <div className="sticky top-0 flex h-[100dvh] flex-col justify-center gap-8 overflow-hidden py-10">
          {head}
          <motion.div ref={track} style={{ x }} className="flex w-max gap-5 pl-[max(1.5rem,calc((100vw-80rem)/2+2rem))] pr-12">{items.map((it, i) => <Story key={it.name + i} it={it} i={i} />)}</motion.div>
          <div className="container-x"><Illustrative light /></div>
        </div>
      ) : (
        <div className="py-20 sm:py-24">
          {head}
          {items.length > 0 && <div className="snap-row mt-10 px-4 pb-2 sm:px-6" tabIndex={0} role="region" aria-label="Practical learning stories">{items.map((it, i) => <div key={it.name + i} style={{ scrollSnapAlign: 'start' }}><Story it={it} i={i} /></div>)}</div>}
          <div className="container-x mt-5"><Illustrative light /></div>
        </div>
      )}
    </section>
  );
}
