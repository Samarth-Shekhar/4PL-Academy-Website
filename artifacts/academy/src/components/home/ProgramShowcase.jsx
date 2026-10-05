import { useMemo, useState } from 'react';
import { usePublicList } from '@/lib/api';
import { REFRESH, useVerified } from '@/lib/home';
import { cn } from '@/lib/cn';
import { CardSkeletons } from '@/components/ui-kit';
import { Head, Body, CtaRow, Pending } from './shared';
import { ProgramCard, CourseCard, CertCard } from '@/components/Cards';
import { programLevel } from '@/lib/format';
import { Link } from 'wouter';

const TABS = [['ug', 'Undergraduate'], ['pg', 'Postgraduate'], ['pro', 'Professional'], ['cert', 'Certification']];

export function ProgramShowcase({ s }) {
  const pq = usePublicList('programs', undefined, { refetchOnWindowFocus: true });
  const cq = usePublicList('courses', undefined, { refetchOnWindowFocus: true });
  const certs = useVerified('certifications');
  const [tab, setTab] = useState('');
  const sortf = (a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  const groups = useMemo(() => {
    const progs = (pq.data || []).slice().sort(sortf);
    return { ug: progs.filter((p) => programLevel(p) === 'ug'), pg: progs.filter((p) => programLevel(p) === 'pg'), pro: (cq.data || []).slice().sort(sortf), cert: certs.list };
  }, [pq.data, cq.data, certs.list]);
  const avail = TABS.filter(([k]) => groups[k].length);
  const active = tab && groups[tab]?.length ? tab : avail[0]?.[0];
  const items = (groups[active] || []).slice(0, 8);
  const card = (it) => active === 'pro' ? <CourseCard c={it} /> : active === 'cert' ? <CertCard c={it} course={(cq.data || []).find((x) => x.id === it.courseId)} program={(pq.data || []).find((x) => x.id === it.programId)} /> : <ProgramCard p={it} />;
  const loading = pq.isLoading || cq.isLoading;
  return (
    <section className="overflow-x-clip bg-mist/70 py-20 sm:py-28" aria-labelledby="sec-programs">
      <div className="container-x min-w-0">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div id="sec-programs"><Head s={s} /><Body s={s} /></div>
          <CtaRow s={s} className="max-w-full [&_.btn]:whitespace-normal" />
        </div>
        {avail.length > 1 && <div className="no-scrollbar mt-9 flex gap-2 overflow-x-auto" role="tablist" aria-label="Program categories">{avail.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => setTab(k)} className={cn('shrink-0 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em]', active === k ? 'border-gold text-navy' : 'border-transparent text-muted-foreground hover:text-navy')}>{l} <span className="opacity-60">{groups[k].length}</span></button>)}</div>}
        <div className="mt-8">
          {loading ? <CardSkeletons n={3} /> : !items.length ? (
            <Pending title="Programs are being published" body="Approved programs and courses appear here as soon as they are published. You can already browse everything listed so far."><Link href="/programs" className="btn btn-navy">All programs</Link><Link href="/courses" className="btn btn-outline">All courses</Link></Pending>
          ) : (
            <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((it) => <li key={`${active}-${it.id}`} className="w-[85vw] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none">{card(it)}</li>)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
