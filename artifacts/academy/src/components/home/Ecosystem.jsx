import { Link } from 'wouter';
import { usePublicList } from '@/lib/api';
import { has } from '@/lib/format';
import { Reveal } from '@/components/ui-kit';
import { Head, Body, Pic, Count, CtaRow } from './shared';

export function Ecosystem({ s }) {
  const unis = usePublicList('universities').data || [];
  const programs = usePublicList('programs').data || [];
  const courses = usePublicList('courses').data || [];
  const partners = unis.filter((u) => u.verified && u.partnershipVerified).length;
  const stats = [
    [unis.filter(u=>u.verified).length, 'Verified university records'],
    [programs.filter(p=>p.verified).length, 'Verified program titles'],
    [courses.filter(c=>c.verified).length, 'Verified course titles'],
    [partners, 'Verified university partners'],
  ].filter(([n]) => n > 0);
  const items = s.items || [];
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="sec-ecosystem">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal><div id="sec-ecosystem"><Head s={s} /></div><Body s={s} /><CtaRow s={s} className="mt-7" /></Reveal>
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((it, i) => {
            const inner = (
              <>
                <Pic src={it.image} alt={it.altText || ''} label={it.name} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" aria-hidden="true" />
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="font-display text-sm text-gold">0{i + 1}</span>
                  <span className="mt-1 block font-display text-2xl leading-tight text-surface">{it.name}</span>
                  {has(it.description) && <span className="mt-1.5 block text-sm leading-snug text-surface/80">{it.description}</span>}
                </span>
              </>
            );
            return (
              <Reveal as="li" key={it.name + i} delay={i * 0.07} className={i % 2 ? 'sm:mt-8' : ''}>
                {has(it.url) && it.url !== 'bot' ? <Link href={it.url} className="group relative block aspect-[4/5] overflow-hidden rounded-lg">{inner}</Link> : <div className="group relative aspect-[4/5] overflow-hidden rounded-lg">{inner}</div>}
              </Reveal>
            );
          })}
        </ul>
      </div>
      {stats.length > 0 && (
        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-4">
          {stats.map(([n, l]) => <div key={l} className="bg-card px-5 py-6"><dd className="font-display text-5xl text-navy"><Count to={n} /></dd><dt className="mt-1 text-xs font-bold uppercase tracking-wider text-gold-deep">{l}</dt></div>)}
        </dl>
      )}
    </section>
  );
}
