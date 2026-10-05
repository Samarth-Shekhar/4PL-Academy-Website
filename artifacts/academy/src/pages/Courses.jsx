import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Briefcase } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { cn } from '@/lib/cn';
import { uniq } from '@/lib/format';
import { PageHero, CardSkeletons, ErrorState, EmptyState } from '@/components/ui-kit';
import { FilterLayout, SelectField, SearchField } from '@/components/FilterLayout';
import { CourseCard } from '@/components/Cards';

const TABS = [{ href: '/courses', label: 'All courses' }, { href: '/courses/short-term', label: 'Short-term' }, { href: '/courses/long-term', label: 'Long-term' }];
const isShort = (c) => /short/i.test(`${c.category} ${c.duration}`);
const isLong = (c) => /long|master|ctcp|diploma/i.test(`${c.category} ${c.name}`) && !isShort(c);

export default function Courses({ variant = 'all' }) {
  const v = variant;
  const [f, setF] = useState({ search: '', category: '', mode: '' });
  const set = (k) => (x) => setF((s) => ({ ...s, [k]: x }));
  const title = v === 'short' ? 'Short-Term Courses' : v === 'long' ? 'Long-Term Courses' : 'Professional Courses';
  useSeo({ title, description: 'Professional courses in global logistics, export import, trade compliance, customs and shipping documentation from 4PL Academy.' });
  const q = usePublicList('courses', { search: f.search.trim(), category: f.category });
  const all = q.data || [];
  const list = useMemo(() => all.filter((c) => (v === 'all' || (v === 'short' ? isShort(c) : isLong(c))) && (!f.mode || (c.mode || '').toLowerCase() === f.mode.toLowerCase())), [all, v, f.mode]);
  const active = [f.category, f.mode].filter(Boolean).length;
  const panel = (<><SelectField id="c-cat" label="Category" value={f.category} onChange={set('category')} options={uniq(all.map((c) => c.category))} /><SelectField id="c-mode" label="Mode" value={f.mode} onChange={set('mode')} options={uniq(all.map((c) => c.mode))} /></>);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Courses', href: v === 'all' ? undefined : '/courses' }, ...(v === 'all' ? [] : [{ label: title }])];
  return (
    <>
      <PageHero crumbs={crumbs} eyebrow="Professional courses" title={title} body="Practical, industry-led courses for students and working professionals in global logistics and international trade.">
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Course type">
          {TABS.map((t) => { const on = (t.href === '/courses' && v === 'all') || (t.href.endsWith('short-term') && v === 'short') || (t.href.endsWith('long-term') && v === 'long'); return <Link key={t.href} href={t.href} className={cn('rounded-full border px-4 py-2 text-sm font-semibold', on ? 'border-gold bg-gold text-navy' : 'border-surface/30 text-surface hover:border-gold')} aria-current={on ? 'page' : undefined}>{t.label}</Link>; })}
        </div>
      </PageHero>
      <FilterLayout search={<SearchField value={f.search} onChange={set('search')} placeholder="Search courses" />} panel={panel} activeCount={active} onReset={() => setF((s) => ({ ...s, category: '', mode: '' }))} count={q.isLoading ? 'Loading courses' : `${list.length} course${list.length === 1 ? '' : 's'}`}>
        {q.isLoading ? <CardSkeletons n={6} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Briefcase} title="No courses in this view" body="Try another course type or clear your search." action={<Link href="/courses" className="btn btn-navy">View all courses</Link>} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((c) => <CourseCard key={c.id} c={c} />)}</div>}
      </FilterLayout>
    </>
  );
}
