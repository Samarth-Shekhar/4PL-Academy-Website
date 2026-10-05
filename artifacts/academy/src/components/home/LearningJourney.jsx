import { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Reveal } from '@/components/ui-kit';
import { Head, Body, CtaRow, Pic, Illustrative } from './shared';
import { Link } from 'wouter';

export function LearningJourney({ s }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  const items = s.items || [];
  return (
    <section className="navy-surface on-navy py-20 sm:py-28" aria-labelledby="sec-journey">
      <div className="container-x">
        <div id="sec-journey"><Head s={s} light /><Body s={s} light /></div>
        <ol ref={ref} className="relative mt-14 space-y-14 sm:space-y-20">
          <span className="absolute bottom-0 left-5 top-0 w-px bg-surface/20 md:left-1/2" aria-hidden="true" />
          <motion.span className="absolute bottom-0 left-5 top-0 w-0.5 origin-top bg-gold md:left-1/2" style={{ scaleY: reduce ? 1 : scrollYProgress }} aria-hidden="true" />
          {items.map((it, i) => (
            <li key={it.name + i} className="relative grid gap-5 pl-14 md:grid-cols-2 md:gap-16 md:pl-0">
              <span className="absolute left-0 top-0 z-10 grid h-10 w-10 place-items-center rounded-full bg-gold font-display text-sm font-bold text-navy ring-4 ring-navy md:left-1/2 md:-translate-x-1/2" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <Reveal className={cn('md:py-4', i % 2 ? 'md:order-2 md:pl-6' : 'md:pr-6 md:text-right')}>
                <p className="font-display text-6xl leading-none text-gold/30 sm:text-7xl" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="-mt-2 text-3xl text-surface sm:text-4xl">{it.name}</h3>
                {has(it.description) && <p className={cn('mt-3 max-w-md leading-relaxed text-surface/75', !(i % 2) && 'md:ml-auto')}>{it.description}</p>}
                {has(it.url) && it.url !== 'bot' && <Link href={it.url} className="mt-3 inline-block text-sm font-bold text-gold underline-offset-4 hover:underline">Learn more</Link>}
              </Reveal>
              <Reveal delay={0.1} className={cn(i % 2 && 'md:order-1')}>
                <div className="aspect-[16/10] overflow-hidden rounded-lg ring-1 ring-surface/15"><Pic src={it.image} alt={it.altText || ''} label={it.name} className="h-full w-full" /></div>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-4"><CtaRow s={s} light /><Illustrative light /></div>
      </div>
    </section>
  );
}
