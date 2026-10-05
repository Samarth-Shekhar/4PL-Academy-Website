import { useMemo, useState } from 'react';
import { usePublicList } from '@/lib/api';
import { REFRESH, useVerified } from '@/lib/home';
import { cn } from '@/lib/cn';
import { CardSkeletons } from '@/components/ui-kit';
import { Head, Body, CtaRow, Pending } from './shared';
import { InteractiveProgramCard } from './InteractiveProgramCard';
import { Link } from 'wouter';

const level = (p) => { const t = `${p.degreeLevel || ''} ${p.degree || ''} ${p.name || ''}`.toLowerCase(); if (/post|master|mba|pgdm|m\.?sc|m\.?com|\bma\b|\bm\.?a\b/.test(t)) return 'pg'; if (/under|bachelor|bba|b\.?com|b\.?sc|bca|\bb\.?a\b|b\.?tech/.test(t)) return 'ug'; return ''; };
const TABS = [['ug', 'Undergraduate'], ['pg', 'Postgraduate'], ['pro', 'Professional'], ['cert', 'Certification']];

export function ProgramShowcase({ s }) {
  const pq = usePublicList('programs', undefined, { refetchInterval: REFRESH });
  const cq = usePublicList('courses', undefined, { refetchInterval: REFRESH });
  const certs = useVerified('certifications');
  const [tab, setTab] = useState('');
  const sortf = (a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  const groups = useMemo(() => {
    const progs = (pq.data || []).slice().sort(sortf);
    const mk = (p) => ({ key: `p${p.id}`, title: p.name, image: p.image, tag: p.degree, sub: p.universityName, href: `/programs/${p.slug}`, facts: [['Duration', p.duration], ['Mode', p.mode], ['University', p.universityName], ['Location', p.location || p.city]] });
    return {
      ug: progs.filter((p) => level(p) === 'ug').map(mk), pg: progs.filter((p) => level(p) === 'pg').map(mk),
      pro: (cq.data || []).slice().sort(sortf).map((c) => ({ key: `c${c.id}`, title: c.name, image: c.image, tag: c.category, sub: c.certification, href: `/courses/${c.slug}`, facts: [['Duration', c.duration], ['Mode', c.mode], ['Hours', c.hours], ['Certification', c.certification]] })),
      cert: certs.list.map((c) => ({ key: `k${c.id}`, title: c.name, image: c.image || c.logo, tag: c.credentialType, sub: c.issuer, href: (() => { const co = (cq.data || []).find((x) => x.id === c.courseId); const pr = (pq.data || []).find((x) => x.id === c.programId); return co ? `/courses/${co.slug}` : pr ? `/programs/${pr.slug}` : '/courses'; })(), facts: [['Issuer', c.issuer], ['Duration', c.duration], ['Credential', c.credentialType]] })),
    };
  }, [pq.data, cq.data, certs.list]);
  const avail = TABS.filter(([k]) => groups[k].length);
  const active = tab && groups[tab]?.length ? tab : avail[0]?.[0];
  const items = (groups[active] || []).slice(0, 6);
  const loading = pq.isLoading || cq.isLoading;
  return (
    <section className="bg-mist/70 py-20 sm:py-28" aria-labelledby="sec-programs">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div id="sec-programs"><Head s={s} /><Body s={s} /></div>
          <CtaRow s={s} />
        </div>
        {avail.length > 1 && <div className="no-scrollbar mt-9 flex gap-2 overflow-x-auto" role="tablist" aria-label="Program categories">{avail.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => setTab(k)} className={cn('shrink-0 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em]', active === k ? 'border-gold text-navy' : 'border-transparent text-muted-foreground hover:text-navy')}>{l} <span className="opacity-60">{groups[k].length}</span></button>)}</div>}
        <div className="mt-8">
          {loading ? <CardSkeletons n={3} /> : !items.length ? (
            <Pending title="Programs are being published" body="Approved programs and courses appear here as soon as they are published. You can already browse everything listed so far."><Link href="/programs" className="btn btn-navy">All programs</Link><Link href="/courses" className="btn btn-outline">All courses</Link></Pending>
          ) : (
            <div className="grid auto-rows-[minmax(18rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {items.map((it, i) => <InteractiveProgramCard key={it.key} item={it} className={cn('min-h-[18rem]', i === 0 ? 'lg:col-span-3 lg:row-span-2' : i < 3 ? 'lg:col-span-3' : 'lg:col-span-2')} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
