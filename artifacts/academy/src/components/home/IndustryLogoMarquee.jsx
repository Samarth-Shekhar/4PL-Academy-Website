import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pic } from './shared';
import { CompanyLogoStrip } from './CompanyLogoStrip';

export function IndustryLogoMarquee({ s }) {
  const items = s.items || [];
  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28" aria-labelledby="sec-industry">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div id="sec-industry"><Head s={s} /><Body s={s} /><CtaRow s={s} className="mt-7" /></div>
          {has(s.image) && <div className="hidden aspect-[16/10] overflow-hidden rounded-lg lg:block"><Pic src={s.image} alt="" className="h-full w-full" /></div>}
        </div>
        {items.length > 0 && <ul className="mt-12 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">{items.map((it, i) => <li key={it.name + i} className="bg-card p-5"><h3 className="text-lg text-navy">{it.name}</h3>{has(it.description) && <p className="mt-1.5 text-sm text-muted-foreground">{it.description}</p>}</li>)}</ul>}
        <div className="mt-12"><CompanyLogoStrip label="Industry brand examples" /></div>
      </div>
    </section>
  );
}
