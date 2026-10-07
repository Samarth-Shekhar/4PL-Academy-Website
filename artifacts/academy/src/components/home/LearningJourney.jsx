import { Link } from 'wouter';
import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pic, Illustrative } from './shared';
import { MovingCards, safeHref } from './MovingCards';

function Step({ it, i }) {
  const href = safeHref(it.url, '/book-counselling');
  const ext = /^https?:/i.test(href);
  const cls = 'group flex h-full w-[min(80vw,22rem)] flex-col overflow-hidden rounded-lg bg-surface/5 ring-1 ring-surface/20 sm:w-[22rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
  const inner = (
    <>
      <div className="aspect-[16/10] overflow-hidden"><Pic src={it.image} alt={it.altText || ''} label={it.name} className="h-full w-full" /></div>
      <div className="flex flex-1 flex-col p-5">
        <span className="font-display text-3xl leading-none text-gold">{String(i + 1).padStart(2, '0')}</span>
        <h3 className="mt-2 text-2xl text-surface">{it.name}</h3>
        {has(it.description) && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-surface/75">{it.description}</p>}
        <span className="mt-auto pt-4 text-sm font-bold text-gold group-hover:underline">Learn more</span>
      </div>
    </>
  );
  return ext ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>;
}

export function LearningJourney({ s }) {
  const items = (s.items || []).filter((it) => !/^apply(?:\s+now)?$/i.test(it.name || '') && !/^\/apply(?:[/?#]|$)/i.test(it.url || ''));
  return (
    <section className="navy-surface on-navy py-16 sm:py-24" aria-labelledby="sec-journey">
      <div className="container-x"><div id="sec-journey"><Head s={s} light /><Body s={s} light /></div></div>
      {items.length > 0 && <MovingCards className="mt-6" label="Your journey steps" items={items} render={(it, i) => <Step it={it} i={i} />} />}
      <div className="container-x mt-4 flex flex-wrap items-center gap-4"><CtaRow s={s} light /><Illustrative light /></div>
    </section>
  );
}
