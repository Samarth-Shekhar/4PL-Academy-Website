import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { cn } from '@/lib/cn';
import { CardSkeletons } from '@/components/ui-kit';
import { Head, Body, Cta, Pending } from './shared';
import { asset, has, programLevel, initials } from '@/lib/format';

const TABS = [['ug', 'Undergraduate'], ['pg', 'Postgraduate']];
const CAMPUS = {
  'sushant-university': '/images/university-campus/sushant.jpg',
  'vivekananda-global-university': '/images/university-campus/vgu.webp',
  'ibmr-group-of-institutions': '/images/university-campus/ibmr.webp',
};
const GENERIC = /^\s*(under|post)graduate\b.*\bat\b/i;
const isAll = (u) => String(u || '').trim().replace(/\/+$/, '') === '/programs';

function MiniCard({ p, uni }) {
  const src = CAMPUS[uni.slug];
  return (
    <Link href={`/programs/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-navy/10 bg-surface transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold" data-testid={`card-program-${p.id}`}>
      <div className="aspect-video w-full overflow-hidden bg-navy">
        {src ? <img src={asset(src)} alt={`${uni.name} campus`} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          : <div className="grid h-full w-full place-items-center" aria-hidden="true"><span className="font-display text-2xl text-gold">{initials(uni.name)}</span></div>}
      </div>
      <div className="flex h-[6.75rem] flex-col gap-1 border-t-2 border-transparent p-4 transition group-hover:border-gold">
        <p className="line-clamp-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep">{uni.name}</p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-navy">{p.name || p.title}</h3>
      </div>
    </Link>
  );
}

export function ProgramShowcase({ s }) {
  const pq = usePublicList('programs', undefined, { refetchOnWindowFocus: true });
  const uq = usePublicList('universities', undefined, { refetchOnWindowFocus: true });
  const [tab, setTab] = useState('');
  const groups = useMemo(() => {
    const unis = new Map((uq.data || []).map((u) => [u.id, u]));
    const rows = (pq.data || [])
      .filter((p) => p.verified === true && has(p.universityId) && has(p.slug) && has(p.name || p.title) && !GENERIC.test(p.name || p.title) && unis.has(p.universityId) && has(unis.get(p.universityId).name) && has(unis.get(p.universityId).slug))
      .map((p) => ({ p, uni: unis.get(p.universityId) }))
      .sort((a, b) => (a.p.sortOrder ?? 0) - (b.p.sortOrder ?? 0));
    return { ug: rows.filter((r) => programLevel(r.p) === 'ug'), pg: rows.filter((r) => programLevel(r.p) === 'pg') };
  }, [pq.data, uq.data]);
  const avail = TABS.filter(([k]) => groups[k].length);
  const active = tab && groups[tab]?.length ? tab : avail[0]?.[0];
  const items = groups[active] || [];
  const loading = pq.isLoading || uq.isLoading;
  const error = pq.isError || uq.isError;
  const retry = () => { pq.refetch(); uq.refetch(); };
  return (
    <section className="overflow-x-clip bg-mist/70 py-24 sm:py-32" aria-labelledby="sec-programs">
      <div className="container-x min-w-0">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div id="sec-programs"><Head s={s} /><Body s={s} /></div>
          {s && !isAll(s.ctaUrl) && <Cta label={s.ctaLabel} url={s.ctaUrl} variant="navy" testid={`cta-${s.slug}-primary`} className="max-w-full self-start whitespace-normal lg:self-auto" />}
          {s && !isAll(s.secondaryCtaUrl) && <Cta label={s.secondaryCtaLabel} url={s.secondaryCtaUrl} variant="outline" testid={`cta-${s.slug}-secondary`} className="max-w-full self-start whitespace-normal lg:self-auto" />}
        </div>
        {avail.length > 1 && <div className="no-scrollbar mt-9 flex gap-2 overflow-x-auto" role="tablist" aria-label="Program levels">{avail.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => setTab(k)} className={cn('shrink-0 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em]', active === k ? 'border-gold text-navy' : 'border-transparent text-muted-foreground hover:text-navy')}>{l} <span className="opacity-60">{groups[k].length}</span></button>)}</div>}
        <div className="mt-8">
          {loading ? <CardSkeletons n={3} /> : error ? (
            <Pending title="Programs could not be loaded" body="Something went wrong while fetching programs. Please try again."><button type="button" onClick={retry} className="btn btn-navy">Retry</button><Link href="/programs" className="btn btn-outline">All programs</Link></Pending>
          ) : !items.length ? (
            <Pending title="Programs are being published" body="Approved programs appear here as soon as they are published. You can already browse everything listed so far."><Link href="/programs" className="btn btn-navy">Check all programs</Link></Pending>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map(({ p, uni }) => <li key={`${active}-${p.id}`} className="min-w-0"><MiniCard p={p} uni={uni} /></li>)}
              </ul>
              <div className="mt-10 flex justify-center">
                <Link href="/programs" className="btn btn-navy" data-testid="link-check-all-programs">Check all programs<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
