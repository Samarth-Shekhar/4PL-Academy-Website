import { bySection, useMedia } from '@/lib/home';
import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pic, Illustrative } from './shared';
import { MovingCards, safeHref } from './MovingCards';
import { Link } from 'wouter';

function Story({ it, i }) {
  const href = safeHref(it.url, '/courses');
  const ext = /^https?:/i.test(href);
  const cls = 'group relative block aspect-[4/5] w-[min(82vw,22rem)] overflow-hidden rounded-lg bg-navy ring-1 ring-surface/15 sm:w-[22rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
  const inner = (
    <>
      <Pic src={it.image} alt={it.altText || ''} label={it.name} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="font-display text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
        <h3 className="mt-1 text-2xl leading-tight text-surface">{it.name}</h3>
        {has(it.description) && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-surface/80">{it.description}</p>}
        <span className="mt-3 inline-block text-sm font-bold text-gold group-hover:underline">Learn more</span>
      </div>
    </>
  );
  return ext ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>;
}

export function PracticalLearning({ s }) {
  const { list } = useMedia();
  const extra = bySection(list, 'practical').filter((m) => m.type === 'image').map((m) => ({ name: m.name, description: m.caption, image: m.url, altText: m.altText }));
  const items = [...(s.items || []), ...extra];
  return (
    <section className="navy-surface on-navy py-14 sm:py-20" aria-labelledby="sec-practical">
      <div id="sec-practical" className="container-x"><Head s={s} light /><Body s={s} light /><CtaRow s={s} light className="mt-6" /></div>
      {items.length > 0 && <MovingCards className="mt-6" label="Learning journey and practical learning" items={items} render={(it, i) => <Story it={it} i={i} />} />}
      <div className="container-x"><Illustrative light /></div>
    </section>
  );
}
