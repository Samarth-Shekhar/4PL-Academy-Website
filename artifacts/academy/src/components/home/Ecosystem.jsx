import { Link } from 'wouter';
import { usePublicList } from '@/lib/api';
import { has } from '@/lib/format';
import { Reveal } from '@/components/ui-kit';
import { Head, Body, Pic, CtaRow } from './shared';

export function Ecosystem({ s }) {
  const unis = usePublicList('universities').data || [];
  const programs = usePublicList('programs').data || [];
  const courses = usePublicList('courses').data || [];
  const partners = unis.filter((u) => u.verified && u.partnershipVerified).length;
  const stats = [
    [unis.length, 'Institutions in the directory'],
    [unis.filter(u=>u.verified).length, 'Verified university records'],
    [programs.filter(p=>p.verified).length, 'Verified program titles'],
    [courses.filter(c=>c.verified).length, 'Verified course titles'],
    [partners, 'Verified university partners'],
  ].filter(([n]) => n > 0);
  const items = s.items || [];
  return (
    <>
    {stats.length > 0 && (
      <div id="academy-overview" className="eco-strip scroll-mt-20" role="region" aria-label="4PL Academy catalogue at a glance">
        <dl className="container-x grid grid-cols-2 lg:grid-cols-none lg:grid-flow-col lg:auto-cols-fr">
          {stats.map(([n, l]) => <div key={l} className="stat-cell"><dd className="font-display text-4xl font-extrabold sm:text-6xl">{n}</dd><dt className="mt-2 text-xs font-semibold sm:text-sm">{l}</dt></div>)}
        </dl>
      </div>
    )}
    <section className="eco-ground" aria-labelledby="sec-ecosystem"><div className="container-x py-20 sm:py-32">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center"><div id="sec-ecosystem" className="[&_.gold-rule]:mx-auto [&_header]:max-w-none"><Head s={s} /></div><div className="[&_p]:mx-auto"><Body s={s} /></div><CtaRow s={s} className="mt-8 justify-center" /></Reveal>
      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => {
          const inner = (
            <>
              <span className="block aspect-[4/3] overflow-hidden rounded-2xl bg-mist"><Pic src={it.image} alt={it.altText || ''} label={it.name} className="transition-transform duration-[900ms] ease-out group-hover:scale-105" /></span>
              <span className="mt-5 block font-display text-2xl leading-tight text-navy">{it.name}</span>
              {has(it.description) && <span className="mt-2 block text-base leading-snug text-muted-foreground">{it.description}</span>}
            </>
          );
          return (
            <Reveal as="li" key={it.name + i} delay={i * 0.08}>
              {has(it.url) && it.url !== 'bot' ? <Link href={it.url} className="group block">{inner}</Link> : <div className="group">{inner}</div>}
            </Reveal>
          );
        })}
      </ul>
    </div></section>
    </>
  );
}
