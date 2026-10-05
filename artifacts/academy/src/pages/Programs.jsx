import { useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { GraduationCap } from 'lucide-react';
import { useGetDiscovery, getGetDiscoveryQueryKey } from '@workspace/api-client-react';
import { usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { FEE_RANGES, has, parseFee, uniq } from '@/lib/format';
import { PageHero, CardSkeletons, ErrorState, EmptyState } from '@/components/ui-kit';
import { FilterLayout, SelectField, SearchField } from '@/components/FilterLayout';
import { ProgramCard } from '@/components/Cards';

const SORTS = [{ value: 'featured', label: 'Featured first' }, { value: 'az', label: 'Name A to Z' }, { value: 'za', label: 'Name Z to A' }, { value: 'fee-asc', label: 'Fee: low to high' }, { value: 'fee-desc', label: 'Fee: high to low' }];

export default function Programs({ level = '' }) {
  const init = new URLSearchParams(useSearch());
  const [f, setF] = useState({ search: init.get('search') || '', location: '', degree: '', degreeLevel: level || init.get('level') || '', specialization: '', duration: '', mode: '', eligibility: '', fee: '', sort: 'featured' });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  useSeo({ title: 'Degree Programs: BBA, MBA and PGDM', description: 'Search and compare industry-integrated undergraduate and postgraduate programs from 4PL Academy and the university directory.' });
  const disc = useGetDiscovery({ query: { queryKey: getGetDiscoveryQueryKey(), staleTime: 30000, refetchOnMount: true } }).data;
  const q = usePublicList('programs', { search: f.search.trim(), location: f.location, degree: f.degree });
  const all = q.data || [];
  const opt = (k) => uniq(all.map((p) => p[k]));
  const list = useMemo(() => {
    const ci = (a, b) => String(a || '').toLowerCase() === b.toLowerCase();
    let r = all.filter((p) => (!f.degreeLevel || ci(p.degreeLevel, f.degreeLevel)) && (!f.specialization || ci(p.specialization, f.specialization)) && (!f.duration || ci(p.duration, f.duration)) && (!f.mode || ci(p.mode, f.mode)) && (!f.eligibility || ci(p.eligibility, f.eligibility)));
    if (f.fee) { const rg = FEE_RANGES.find((x) => x.id === f.fee); r = r.filter((p) => { const n = parseFee(p.fee); return n !== null && rg.test(n); }); }
    const fee = (p) => parseFee(p.fee);
    const s = [...r];
    if (f.sort === 'az') s.sort((a, b) => a.name.localeCompare(b.name));
    else if (f.sort === 'za') s.sort((a, b) => b.name.localeCompare(a.name));
    else if (f.sort === 'fee-asc' || f.sort === 'fee-desc') s.sort((a, b) => { const x = fee(a), y = fee(b); if (x === null) return 1; if (y === null) return -1; return f.sort === 'fee-asc' ? x - y : y - x; });
    else s.sort((a, b) => Number(b.featured) - Number(a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return s;
  }, [all, f]);
  const active = ['location', 'degree', 'degreeLevel', 'specialization', 'duration', 'mode', 'eligibility', 'fee'].filter((k) => f[k]).length;
  const reset = () => setF((x) => ({ ...x, location: '', degree: '', degreeLevel: '', specialization: '', duration: '', mode: '', eligibility: '', fee: '' }));
  const panel = (
    <>
      <SelectField id="f-sort" label="Sort by" value={f.sort} onChange={set('sort')} options={SORTS} any="Default" />
      <SelectField id="f-loc" label="Location" value={f.location} onChange={set('location')} options={disc?.locations || []} />
      <SelectField id="f-deg" label="Degree" value={f.degree} onChange={set('degree')} options={disc?.degrees || []} />
      <SelectField id="f-level" label="Degree level" value={f.degreeLevel} onChange={set('degreeLevel')} options={opt('degreeLevel')} />
      <SelectField id="f-spec" label="Specialization" value={f.specialization} onChange={set('specialization')} options={opt('specialization')} />
      <SelectField id="f-dur" label="Duration" value={f.duration} onChange={set('duration')} options={opt('duration')} />
      <SelectField id="f-mode" label="Mode" value={f.mode} onChange={set('mode')} options={opt('mode')} />
      <SelectField id="f-elig" label="Eligibility" value={f.eligibility} onChange={set('eligibility')} options={opt('eligibility')} />
      <SelectField id="f-fee" label="Fee range" value={f.fee} onChange={set('fee')} options={FEE_RANGES.map((r) => ({ value: r.id, label: r.label }))} />
      {f.fee && <p className="hint">Programs with a fee that is still to be verified are hidden while a fee range is selected.</p>}
    </>
  );
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Programs' }]} eyebrow="Degree programs" title="Find the degree that fits your career" body="Industry-integrated BBA and MBA/PGDM programs, plus degree listings discovered across universities. Compare up to three side by side." />
      <FilterLayout search={<SearchField value={f.search} onChange={set('search')} placeholder="Search by program, university or specialization" />} panel={panel} activeCount={active} onReset={reset} count={q.isLoading ? 'Loading programs' : `${list.length} program${list.length === 1 ? '' : 's'} found`}>
        {q.isLoading ? <CardSkeletons n={6} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? (
          <EmptyState icon={GraduationCap} title="No programs match these filters" body="Try removing a filter or searching a broader term." action={<button type="button" className="btn btn-navy" onClick={() => setF((x) => ({ ...x, search: '', location: '', degree: '', degreeLevel: '', specialization: '', duration: '', mode: '', eligibility: '', fee: '' }))}>Clear everything</button>} />
        ) : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <ProgramCard key={p.id} p={p} />)}</div>}
      </FilterLayout>
      {has(disc) && null}
    </>
  );
}
