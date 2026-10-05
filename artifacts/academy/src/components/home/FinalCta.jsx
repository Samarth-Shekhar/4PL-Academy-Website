import { has } from '@/lib/format';
import { Reveal } from '@/components/ui-kit';
import { Cta, Pic } from './shared';

export function FinalCta({ s }) {
  const extra = (s.items || []).filter((i) => has(i.url));
  return (
    <section className="navy-surface on-navy grain relative overflow-hidden" aria-labelledby="sec-final">
      {has(s.image) && <><div className="absolute inset-0 -z-10"><Pic src={s.image} alt="" className="h-full w-full" imgClassName="kb-a" /></div><div className="absolute inset-0 -z-10 bg-navy/80" aria-hidden="true" /></>}
      <div className="container-x py-28 text-center sm:py-40">
        <Reveal>
          <h2 id="sec-final" className="display-xl mx-auto max-w-5xl text-surface">{s.name}</h2>
          {has(s.shortDescription) && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface/85 sm:text-xl">{s.shortDescription}</p>}
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Cta label={s.ctaLabel} url={s.ctaUrl} testid="cta-final-primary" />
            <Cta label={s.secondaryCtaLabel} url={s.secondaryCtaUrl} variant="light" />
            {extra.map((i, k) => <Cta key={i.name + k} label={i.name} url={i.url} variant="light" testid={k === extra.length - 1 ? 'button-cta-bot' : undefined} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
