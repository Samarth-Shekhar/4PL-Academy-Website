import { motion, useReducedMotion } from 'framer-motion';
import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pic } from './shared';
import { Link } from 'wouter';

export function AdmissionTimeline({ s }) {
  const reduce = useReducedMotion();
  const items = s.items || [];
  return (
    <section className="bg-mist/70 py-20 sm:py-28" aria-labelledby="sec-admissions">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div id="sec-admissions"><Head s={s} /><Body s={s} /></div><CtaRow s={s} /></div>
        <div className="relative mt-14">
          <motion.span className="absolute left-0 right-0 top-[7.75rem] hidden h-0.5 origin-left bg-gold lg:block" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.8, ease: 'easeInOut' }} aria-hidden="true" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
            {items.map((it, i) => (
              <motion.li key={it.name + i} className="relative" initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.18, duration: 0.5 }}>
                <div className="aspect-[4/3] overflow-hidden rounded-lg"><Pic src={it.image} alt={it.altText || ''} label={it.name} className="h-full w-full" /></div>
                <span className="relative z-10 mt-4 grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-sm text-gold ring-4 ring-mist" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-xl leading-snug text-navy">{it.name}</h3>
                {has(it.description) && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.description}</p>}
                {has(it.url) && it.url !== 'bot' && <Link href={it.url} className="mt-2 inline-block text-sm font-bold text-navy underline underline-offset-4">Go</Link>}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
