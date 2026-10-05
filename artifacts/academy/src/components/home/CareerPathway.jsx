import { useState } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Head, Body, CtaRow, Pic, Illustrative } from './shared';

export function CareerPathway({ s }) {
  const items = s.items || [];
  const [i, setI] = useState(0);
  const cur = items[i] || items[0];
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="sec-careers">
      <div id="sec-careers"><Head s={s} /><Body s={s} /></div>
      {cur && (
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible" role="tablist" aria-label="Career pathways" aria-orientation="vertical">
            {items.map((it, k) => (
              <li key={it.name + k} className="shrink-0">
                <button type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)} className={cn('flex w-full items-center justify-between gap-6 border-b px-1 py-3 text-left font-display text-xl transition sm:text-2xl lg:py-4 lg:text-3xl', k === i ? 'border-gold text-navy' : 'border-line text-navy/45 hover:text-navy')}>
                  <span><span className="mr-3 text-sm text-gold-deep">{String(k + 1).padStart(2, '0')}</span>{it.name}</span><ArrowRight className={cn('hidden h-5 w-5 transition lg:block', k === i ? 'translate-x-0 text-gold-deep' : '-translate-x-2 opacity-0')} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div role="tabpanel" aria-live="polite">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-navy">
              <AnimatePresence mode="wait"><motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><Pic src={cur.image} alt={cur.altText || ''} label={cur.name} className="h-full w-full" /></motion.div></AnimatePresence>
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
