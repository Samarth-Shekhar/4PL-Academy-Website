import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowUpRight, Cpu, Layers, Workflow } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { focusPrograms } from '@/lib/program-focus';
import { has } from '@/lib/format';
import { Cta } from './shared';

export function AiLearningStudio({ sections }) {
  const reduce = useReducedMotion();
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
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-gold"><Cpu className="h-4 w-4" />Learning for an AI-shaped world</p>
            <h2 id="learning-studio-title" className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">{intro?.name || 'Discover your direction in AI.'}</h2>
            {has(intro?.shortDescription) && <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">{intro.shortDescription}</p>}
            <div className="mt-8 space-y-3">
              {programs.map((p) => <Link key={p.id} href={`/programs/${p.slug}`} className="studio-program group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 transition-colors hover:border-gold/70 hover:bg-white/10">
                <span className="min-w-0"><span className="block text-xs font-bold text-gold">{p.degree || 'Undergraduate'}</span><span className="mt-1 block text-sm font-semibold leading-relaxed">{p.name}</span></span><ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>)}
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-between">
            <div className="studio-network relative mb-8 grid h-44 place-items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-52" aria-hidden="true">
              <svg viewBox="0 0 500 200" className="absolute inset-0 h-full w-full fill-none stroke-gold/50" preserveAspectRatio="xMidYMid slice">
                {[30, 75, 125, 170].map((y, i) => <g key={y}><motion.path d={`M0 ${y} H${80 + i * 20} L210 100 H290 L${420 - i * 20} ${y} H500`} strokeWidth="1" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: i * .12 }} /><circle cx={80 + i * 20} cy={y} r="4" fill="currentColor" className="text-gold" /><circle cx={420 - i * 20} cy={y} r="4" fill="currentColor" className="text-gold" /></g>)}
              </svg>
              <span className="relative grid h-24 w-24 place-items-center rounded-3xl border border-gold/60 bg-navy font-display text-4xl font-extrabold text-gold shadow-[0_0_65px_#d6a62e30]">AI</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {details.map((s, i) => <article key={s.id} className="min-w-0"><span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">{i % 2 ? <Workflow className="h-5 w-5" /> : <Layers className="h-5 w-5" />}</span><h3 className="font-display text-xl font-bold leading-tight">{s.name}</h3>{has(s.shortDescription) && <p className="mt-3 text-sm leading-relaxed text-white/65">{s.shortDescription}</p>}</article>)}
            </div>
            {actions.length > 0 && <div className="mt-8 flex flex-wrap gap-3">{actions.map((s) => <Cta key={s.ctaUrl} label={s.ctaLabel} url={s.ctaUrl} variant="gold" />)}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
