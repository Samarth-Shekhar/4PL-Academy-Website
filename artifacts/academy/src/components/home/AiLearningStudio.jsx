import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { mediaUrl } from '@/lib/home';
import { usePublicList } from '@/lib/api';
import { focusPrograms } from '@/lib/program-focus';
import { has } from '@/lib/format';
import { Cta } from './shared';

export function AiLearningStudio({ sections }) {
  const { data = [] } = usePublicList('programs');
  const programs = focusPrograms(data).filter((p) => /artificial|ai-/i.test(p.slug));
  const intro = sections.find((s) => (s.section || s.slug) === 'ecosystem');
  const details = sections.filter((s) => s !== intro);
  const actions = [...new Map(sections.filter((s) => has(s.ctaUrl) && has(s.ctaLabel)).map((s) => [s.ctaUrl, s])).values()];
  return (
    <section className="container-x py-14 sm:py-24" aria-labelledby="learning-studio-title">
      <div className="learning-studio relative isolate overflow-hidden rounded-[2rem] bg-navy text-white">
        <div className="relative z-10 grid min-w-0 gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
          <div className="min-w-0">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-gold"><span aria-hidden="true" className="h-0.5 w-5 bg-gold" />Learning for an AI-shaped world</p>
            <h2 id="learning-studio-title" className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">{intro?.name || 'Discover your direction in AI.'}</h2>
            {has(intro?.shortDescription) && <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">{intro.shortDescription}</p>}
            <div className="mt-8 space-y-3">
              {programs.map((p) => <Link key={p.id} href={`/programs/${p.slug}`} className="studio-program group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 transition-colors hover:border-gold/70 hover:bg-white/10">
                <span className="min-w-0"><span className="block text-xs font-bold text-gold">{p.degree || 'Undergraduate'}</span><span className="mt-1 block text-sm font-semibold leading-relaxed">{p.name}</span></span><ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>)}
            </div>
            <figure className="mt-8 overflow-hidden rounded-3xl border border-white/10">
              <img className="aspect-[16/10] w-full object-cover" src={mediaUrl('/images/edtech/robot-workshop-960.webp')} srcSet={`${mediaUrl('/images/edtech/robot-workshop-640.webp')} 640w, ${mediaUrl('/images/edtech/robot-workshop-960.webp')} 960w, ${mediaUrl('/images/edtech/robot-workshop-1440.webp')} 1440w`} sizes="(min-width:1024px) 560px, 92vw" alt="Illustration of two autonomous mobile robots with arms holding an engine block in a workshop" width="960" height="960" loading="lazy" decoding="async" />
            </figure>
          </div>
          <div className="flex min-w-0 flex-col justify-between">
            <figure className="studio-photo mb-8 overflow-hidden rounded-3xl border border-white/10">
              <img className="aspect-[4/3] w-full object-cover" src={mediaUrl('/images/edtech/robot-lab-960.webp')} srcSet={`${mediaUrl('/images/edtech/robot-lab-640.webp')} 640w, ${mediaUrl('/images/edtech/robot-lab-960.webp')} 960w, ${mediaUrl('/images/edtech/robot-lab-1440.webp')} 1440w`} sizes="(min-width:1024px) 560px, 92vw" alt="Illustration of a navy and gold industrial robot arm placing a precision tool over a circuit board" width="960" height="960" loading="lazy" decoding="async" />
            </figure>
            <div className="grid gap-5 sm:grid-cols-2">
              {details.map((s) => <article key={s.id} className="min-w-0"><span aria-hidden="true" className="mb-3 block h-0.5 w-8 bg-gold" /><h3 className="font-display text-xl font-bold leading-tight">{s.name}</h3>{has(s.shortDescription) && <p className="mt-3 text-sm leading-relaxed text-white/65">{s.shortDescription}</p>}</article>)}
            </div>
            {actions.length > 0 && <div className="mt-8 flex flex-wrap gap-3">{actions.map((s) => <Cta key={s.ctaUrl} label={s.ctaLabel} url={s.ctaUrl} variant="gold" />)}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
