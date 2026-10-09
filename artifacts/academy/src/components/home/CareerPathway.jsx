import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Head, Body, CtaRow, Pic, Illustrative } from './shared';

export function CareerPathway({ s }) {
  const items = s.items || [];
  const [i, setI] = useState(0);
  const selected = Math.min(i, Math.max(0, items.length - 1));
  const cur = items[selected];
  const id = useId();
  const tabs = useRef([]);
  const reduce = useReducedMotion();
  const [vertical, setVertical] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setVertical(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const onTabKeyDown = (event, index) => {
    let next;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % items.length;
    else if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (index - 1 + items.length) % items.length;
    else return;
    event.preventDefault();
    setI(next);
    tabs.current[next]?.focus();
  };
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="sec-careers">
      <div id="sec-careers"><Head s={s} /><Body s={s} /></div>
      {cur && (
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible" role="tablist" aria-label="Course pathways" aria-orientation={vertical ? 'vertical' : 'horizontal'}>
            {items.map((it, k) => (
              <li key={it.name + k} role="presentation" className="shrink-0">
                <button ref={node => { tabs.current[k] = node; }} id={`${id}-tab-${k}`} aria-controls={`${id}-panel`} tabIndex={k === selected ? 0 : -1} onKeyDown={event => onTabKeyDown(event, k)} type="button" role="tab" aria-selected={k === selected} onClick={() => setI(k)} className={cn('flex w-full items-center justify-between gap-6 border-b px-1 py-3 text-left font-display text-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold sm:text-2xl lg:py-4 lg:text-3xl', k === selected ? 'border-gold text-navy' : 'border-line text-navy/65 hover:text-navy')}>
                  <span><span className="mr-3 text-sm text-gold-deep">{String(k + 1).padStart(2, '0')}</span>{it.name}</span><ArrowRight className={cn('hidden h-5 w-5 transition lg:block', k === selected ? 'translate-x-0 text-gold-deep' : '-translate-x-2 opacity-0')} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`} aria-live="polite" tabIndex={0}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-navy">
              <AnimatePresence mode="wait"><motion.div key={selected} className="absolute inset-0" initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? {} : { opacity: 0 }} transition={{ duration: reduce ? 0 : 0.5 }}><Pic src={cur.image} alt={cur.altText || ''} label={cur.name} className="h-full w-full" /></motion.div></AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-5 sm:p-7">
                <h3 className="text-2xl text-surface sm:text-3xl">{cur.name}</h3>
                {has(cur.description) && <p className="mt-2 max-w-lg text-sm leading-relaxed text-surface/85 sm:text-base">{cur.description}</p>}
                {has(cur.url) && cur.url !== 'bot' && <Link href={cur.url} className="btn btn-gold btn-sm mt-3">Explore related programs</Link>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><Illustrative /><CtaRow s={s} /></div>
          </div>
        </div>
      )}
    </section>
  );
}
