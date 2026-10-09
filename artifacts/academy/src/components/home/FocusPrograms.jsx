import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Compass } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { has, asset, initials } from '@/lib/format';
import { Reveal, CardSkeletons } from '@/components/ui-kit';
import { FOCUS_PROGRAMS, focusPrograms, programFocusImage } from '@/lib/program-focus';
import { mediaUrl } from '@/lib/home';

function Tile({ p, i }) {
  const [bad, setBad] = useState(false);
  const meta = FOCUS_PROGRAMS.find((f) => f.slug === p.slug);
  const src = programFocusImage(p);
  const sub = [p.universityName, p.duration, p.degreeLevel].filter(has).join('  /  ');
  return (
    <Link href={`/programs/${p.slug}`} data-testid={`card-focus-${p.slug}`} className="focus-tile group relative isolate flex aspect-[16/10] min-h-[20rem] w-full min-w-0 flex-col justify-end overflow-hidden rounded-[1.5rem] bg-navy text-surface">
      {has(src) && !bad ? <img src={/^(https?:|\/\/)/.test(src) ? src : (src.startsWith('/') ? asset(src) : src)} alt={p.imageAlt || meta?.alt || ''} loading="lazy" decoding="async" onError={() => setBad(true)} className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none" />
        : <span aria-hidden="true" className="absolute right-4 top-2 -z-10 font-display text-8xl font-extrabold text-gold/20">{initials(p.name)}</span>}
      <span aria-hidden="true" className="focus-scrim absolute inset-0 -z-10" />
      <div className="p-5 sm:p-6">
        <span className="chip chip-gold mb-3">{String(i + 1).padStart(2, '0')} / Focus program</span>
        <h3 className="font-display text-2xl font-extrabold leading-tight text-surface sm:text-3xl">{p.name}</h3>
        {has(sub) && <p className="mt-2 text-sm text-surface/75">{sub}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gold">View program <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function FocusPrograms() {
  const q = usePublicList('programs', undefined, { refetchOnWindowFocus: true });
  const rows = focusPrograms(q.data || []);
  if (!q.isLoading && !rows.length) return null;
  return (
    <section className="py-14 sm:py-24" aria-labelledby="focus-h" data-testid="section-focus-programs">
      <div className="container-x">
        <Reveal>
          <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-3"><Compass className="h-4 w-4" aria-hidden="true" />Industry-integrated programmes</p>
              <h2 id="focus-h" className="display-lg text-navy">AI, business, technology & global trade.</h2>
              <div className="gold-rule mt-5" />
            </div>
            <Link href="/programs" className="btn btn-outline self-start">All programs <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </Reveal>
        {q.isLoading ? <CardSkeletons n={4} className="h-72" /> : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{rows.map((p, i) => <Reveal key={p.id || p.slug} delay={i * 0.08} className="min-w-0"><Tile p={p} i={i} /></Reveal>)}</div>
        )}
        {rows.find(p => has(p.catalogueUrl)) && <a href={mediaUrl(rows.find(p => has(p.catalogueUrl)).catalogueUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-6">Read the complete programme catalogue <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>}
      </div>
    </section>
  );
}
