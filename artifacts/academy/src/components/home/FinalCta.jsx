import { has } from '@/lib/format';
import { Reveal } from '@/components/ui-kit';
import { Cta } from './shared';

export function FinalCta({ s }) {
  const extra = (s.items || []).filter((i) => has(i.url));
  return (
    <section className="relative overflow-hidden bg-white text-navy" aria-labelledby="sec-final">
      <div className="container-x py-28 text-center sm:py-40">
        <Reveal>
          <h2 id="sec-final" className="display-xl mx-auto max-w-5xl text-navy">{s.name}</h2>
          <span className="mx-auto mt-6 block h-1 w-16 rounded-full bg-gold" aria-hidden="true" />
          {has(s.shortDescription) && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy/80 sm:text-xl">{s.shortDescription}</p>}
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Cta label={s.ctaLabel} url={s.ctaUrl} testid="cta-final-primary" />
            <Cta label={s.secondaryCtaLabel} url={s.secondaryCtaUrl} variant="outline" className="border-gold/60 hover:border-gold" />
            {extra.map((i, k) => <Cta key={i.name + k} label={i.name} url={i.url} variant="outline" className="border-gold/60 hover:border-gold" testid={k === extra.length - 1 ? 'button-cta-bot' : undefined} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
