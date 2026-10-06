import { Link } from 'wouter';
import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pic } from './shared';
import { MovingCards, safeHref } from './MovingCards';

function Step({ it, i }) {
  const href = safeHref(it.url, '/apply');
  const ext = /^https?:/i.test(href);
  const cls = 'group flex h-full w-[min(78vw,19rem)] flex-col overflow-hidden rounded-lg bg-surface ring-1 ring-line sm:w-[19rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
  const inner = (
    <>
      <div className="aspect-[4/3] overflow-hidden"><Pic src={it.image} alt={it.altText || ''} label={it.name} className="h-full w-full" /></div>
      <div className="flex flex-1 flex-col p-5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-navy font-display text-sm text-gold" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <h3 className="mt-3 text-xl leading-snug text-navy">{it.name}</h3>
        {has(it.description) && <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{it.description}</p>}
        <span className="mt-auto pt-3 text-sm font-bold text-navy underline underline-offset-4">Go</span>
      </div>
    </>
  );
  return ext ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>;
}

export function AdmissionTimeline({ s }) {
  const items = s.items || [];
  return (
    <section className="bg-mist/70 py-16 sm:py-24" aria-labelledby="sec-admissions">
      <div className="container-x flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div id="sec-admissions"><Head s={s} /><Body s={s} /></div><CtaRow s={s} /></div>
      {items.length > 0 && <MovingCards className="mt-6" label="Admission steps" items={items} render={(it, i) => <Step it={it} i={i} />} />}
    </section>
  );
}
