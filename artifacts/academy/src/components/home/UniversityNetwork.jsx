import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Building2 } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { REFRESH } from '@/lib/home';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui-kit';
import { Head, Body, CtaRow, Pending } from './shared';
import { IndiaUniversityMap, project } from './IndiaUniversityMap';
import { UniversityCard } from './UniversityCard';

const num = (v) => (v === null || v === undefined || v === '' ? NaN : Number(v));
const valid = (u) => Number.isFinite(num(u.latitude)) && Number.isFinite(num(u.longitude)) && num(u.latitude) >= 6 && num(u.latitude) <= 38 && num(u.longitude) >= 68 && num(u.longitude) <= 98;

export function UniversityNetwork({ s }) {
  const uq = usePublicList('universities', undefined, { refetchOnWindowFocus: true });
  const pq = usePublicList('programs', undefined, { refetchOnWindowFocus: true });
  const [selected, setSelected] = useState(null);
  const [activeUni, setActiveUni] = useState(null);
  const all = uq.data || [];
  const pool = all;
  const mapped = pool.filter(valid);
  const unmapped = pool.length - mapped.length;
  const programsOf = (u) => (pq.data || []).filter((p) => (p.universityId != null && p.universityId === u.id) || (p.universityId == null && has(p.universityName) && p.universityName === u.name));
  const regions = useMemo(() => {
    const g = new Map();
    mapped.forEach((u) => { const label = (has(u.region) ? u.region : has(u.city) ? u.city : u.state) || 'Other'; const k = label.toLowerCase(); if (!g.has(k)) g.set(k, { key: k, label, unis: [] }); g.get(k).unis.push(u); });
    return [...g.values()].map((r) => {
      const seen = new Map();
      const unis = r.unis.map((u) => { const p = project(num(u.latitude), num(u.longitude)); const sk = `${p.x.toFixed(0)}-${p.y.toFixed(0)}`; const c = seen.get(sk) || 0; seen.set(sk, c + 1); const a = c * 2.4; return { ...u, pt: c ? { x: p.x + Math.cos(a) * 10 * Math.ceil(c / 6), y: p.y + Math.sin(a) * 10 * Math.ceil(c / 6) } : p }; });
      const ax = unis.reduce((t, u) => t + u.pt.x, 0) / unis.length; const ay = unis.reduce((t, u) => t + u.pt.y, 0) / unis.length;
      return { ...r, unis, pt: { x: ax, y: ay } };
    }).sort((a, b) => b.unis.length - a.unis.length);
  }, [mapped]);
  const sel = regions.find((r) => r.key === selected);
  const pick = (k) => { setSelected(k); setActiveUni(null); };
  return (
    <section className="bg-mist/55 py-16 text-navy sm:py-24" aria-labelledby="sec-universities" data-testid="section-university-network">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div id="sec-universities" className="min-w-0 lg:pt-6">
            <Head s={s} />
            <Body s={s} />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">Explore university locations and find the 4PL Academy team in Noida. Select a location to discover its programs.</p>
            <CtaRow s={s} className="mt-7 max-w-full [&_.btn]:max-w-full [&_.btn]:whitespace-normal" />
            {regions.length > 0 && (
              <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Choose a region">
                {regions.map((r) => <button key={r.key} type="button" data-testid={`button-map-region-${r.key}`} aria-pressed={r.key === selected} onClick={() => pick(r.key === selected ? null : r.key)} className={cn('shrink-0 rounded-full border px-5 py-3 text-sm font-semibold transition-colors', r.key === selected ? 'border-gold bg-gold text-navy' : 'border-navy/15 bg-white text-navy hover:border-gold hover:bg-gold-soft')}>{r.label} <span className="ml-1 opacity-70">{r.unis.length}</span></button>)}
              </div>
            )}
          </div>
          <div className="min-w-0 rounded-[2rem] border border-gold/20 bg-white p-3 shadow-sm">
            {uq.isLoading ? <Skeleton className="mx-auto aspect-[600/640] w-full max-w-[34rem]" /> : (
              <IndiaUniversityMap regions={regions} selected={selected} onSelect={pick} activeUni={activeUni} onUni={setActiveUni} programsOf={programsOf} />
            )}
            {!uq.isLoading && !regions.length && (
              <div className="mt-5 text-navy"><Pending title="Explore our universities" body="Find institutions and their programs in the directory."><Link href="/universities" className="btn btn-gold">Browse the directory</Link></Pending></div>
            )}
            {unmapped > 0 && <p className="mt-3 text-center text-xs text-muted-foreground"><Link href="/universities" className="underline">Explore all institutions in the directory.</Link></p>}
          </div>
        </div>
        {sel && (
          <div className="mt-12 rounded-lg bg-surface p-4 text-navy sm:p-6" aria-live="polite">
            <h3 className="flex items-center gap-2 text-2xl"><Building2 className="h-6 w-6 text-gold-deep" aria-hidden="true" />{sel.label}<span className="text-base font-normal text-muted-foreground">{sel.unis.length} {sel.unis.length === 1 ? 'university' : 'universities'}</span></h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sel.unis.map((u) => <UniversityCard key={u.id} u={u} programs={programsOf(u)} active={activeUni === u.id} onFocus={() => setActiveUni(u.id)} />)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
