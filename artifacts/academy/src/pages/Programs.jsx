import { useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { GraduationCap } from 'lucide-react';
import { useGetDiscovery, getGetDiscoveryQueryKey } from '@workspace/api-client-react';
import { usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { FEE_RANGES, has, parseFee, uniq, programLevel } from '@/lib/format';
import { cn } from '@/lib/cn';
import { PageHero, CardSkeletons, ErrorState, EmptyState } from '@/components/ui-kit';
import { FilterLayout, SelectField, SearchField } from '@/components/FilterLayout';
import { FOCUS_PROGRAMS } from '@/lib/program-focus';
import { ProgramCard, CourseCard, CertCard } from '@/components/Cards';

const TYPES = [['all', 'All'], ['ug', 'Undergraduate'], ['pg', 'Postgraduate'], ['pro', 'Professional'], ['cert', 'Certification']];
const SORTS = [{ value: 'featured', label: 'Featured first' }, { value: 'az', label: 'Name A to Z' }, { value: 'za', label: 'Name Z to A' }, { value: 'fee-asc', label: 'Fee: low to high' }, { value: 'fee-desc', label: 'Fee: high to low' }];

export default function Programs({ level = '' }) {
  const init = new URLSearchParams(useSearch());
  const [f, setF] = useState({ search: init.get('search') || '', university: '', location: '', degree: '', degreeLevel: init.get('level') || '', specialization: '', duration: '', mode: '', eligibility: '', fee: '', sort: 'featured' });
  const [type, setType] = useState(level === 'Undergraduate' ? 'ug' : level === 'Postgraduate' ? 'pg' : ['ug', 'pg', 'pro', 'cert'].includes(init.get('type')) ? init.get('type') : 'all');
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  useSeo({ title: 'Degree Programs: BBA, MBA and PGDM', description: 'Search and compare industry-integrated undergraduate and postgraduate programs from 4PL Academy and the university directory.' });
  const disc = useGetDiscovery({ query: { queryKey: getGetDiscoveryQueryKey(), staleTime: 30000, refetchOnMount: true } }).data;
  const q = usePublicList('programs', { search: f.search.trim(), location: f.location, degree: f.degree });
  const all = q.data || [];
  const useCourses = usePublicList('courses');
  const useCerts = usePublicList('certifications');
  const opt = (k) => uniq(all.map((p) => p[k]));
  const fr = (p) => { const i = FOCUS_PROGRAMS.findIndex((x) => x.slug === p.slug); return i === -1 ? 99 : i; };
  const list = useMemo(() => {
    const ci = (a, b) => String(a || '').toLowerCase() === b.toLowerCase();
    let r = all.filter((p) => (type !== 'ug' && type !== 'pg' || programLevel(p) === type) && (!f.university || ci(p.universityName, f.university)) && (!f.degreeLevel || ci(p.degreeLevel, f.degreeLevel)) && (!f.specialization || ci(p.specialization, f.specialization)) && (!f.duration || ci(p.duration, f.duration)) && (!f.mode || ci(p.mode, f.mode)) && (!f.eligibility || ci(p.eligibility, f.eligibility)));
    if (f.fee) { const rg = FEE_RANGES.find((x) => x.id === f.fee); r = r.filter((p) => { const n = parseFee(p.fee); return n !== null && rg.test(n); }); }
    const fee = (p) => parseFee(p.fee);
    const s = [...r];
    if (f.sort === 'az') s.sort((a, b) => a.name.localeCompare(b.name));
    else if (f.sort === 'za') s.sort((a, b) => b.name.localeCompare(a.name));
    else if (f.sort === 'fee-asc' || f.sort === 'fee-desc') s.sort((a, b) => { const x = fee(a), y = fee(b); if (x === null) return 1; if (y === null) return -1; return f.sort === 'fee-asc' ? x - y : y - x; });
    else s.sort((a, b) => fr(a) - fr(b) || Number(b.featured) - Number(a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return s;
  }, [all, f, type]);
  const needle = f.search.trim().toLowerCase();
  const matchTxt = (x) => !needle || `${x.name} ${x.category || ''} ${x.issuer || ''} ${x.shortDescription || ''}`.toLowerCase().includes(needle);
  const courses = (useCourses.data || []).filter((c) => matchTxt(c) && (!f.mode || String(c.mode || '').toLowerCase() === f.mode.toLowerCase()) && (!f.duration || String(c.duration || '').toLowerCase() === f.duration.toLowerCase()));
  const certs = (useCerts.data || []).filter((c) => c.verified === true && matchTxt(c));
  const isProg = type === 'all' || type === 'ug' || type === 'pg';
  const active = ['university', 'location', 'degree', 'degreeLevel', 'specialization', 'duration', 'mode', 'eligibility', 'fee'].filter((k) => f[k]).length;
  const reset = () => setF((x) => ({ ...x, university: '', location: '', degree: '', degreeLevel: '', specialization: '', duration: '', mode: '', eligibility: '', fee: '' }));
  const proPanel = (
    <>
      <SelectField id="f-dur" label="Duration" value={f.duration} onChange={set('duration')} options={uniq(courses.length ? (useCourses.data || []).map((c) => c.duration) : [])} />
      <SelectField id="f-mode" label="Mode" value={f.mode} onChange={set('mode')} options={uniq((useCourses.data || []).map((c) => c.mode))} />
    </>
  );
  const panel = !isProg ? proPanel : (
    <>
      <SelectField id="f-sort" label="Sort by" value={f.sort} onChange={set('sort')} options={SORTS} any="Default" />
      <SelectField id="f-uni" label="University" value={f.university} onChange={set('university')} options={opt('universityName')} />
      <SelectField id="f-loc" label="Location" value={f.location} onChange={set('location')} options={disc?.locations || []} />
      <SelectField id="f-deg" label="Degree" value={f.degree} onChange={set('degree')} options={disc?.degrees || []} />
      <SelectField id="f-level" label="Degree level" value={f.degreeLevel} onChange={set('degreeLevel')} options={opt('degreeLevel')} />
      <SelectField id="f-spec" label="Specialization" value={f.specialization} onChange={set('specialization')} options={opt('specialization')} />
      <SelectField id="f-dur" label="Duration" value={f.duration} onChange={set('duration')} options={opt('duration')} />
      <SelectField id="f-mode" label="Mode" value={f.mode} onChange={set('mode')} options={opt('mode')} />
      <SelectField id="f-elig" label="Eligibility" value={f.eligibility} onChange={set('eligibility')} options={opt('eligibility')} />
      <SelectField id="f-fee" label="Fee range" value={f.fee} onChange={set('fee')} options={FEE_RANGES.map((r) => ({ value: r.id, label: r.label }))} />

    </>
  );
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Programs' }]} eyebrow="Degree programs" title="Find the degree that fits your career" body="Industry-integrated BBA and MBA/PGDM programs, plus degree listings discovered across universities. Compare up to three side by side." />
      <div className="container-x -mb-4 mt-6"><div role="tablist" aria-label="Program type" className="no-scrollbar flex gap-2 overflow-x-auto">{TYPES.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={type === k} onClick={() => setType(k)} data-testid={`tab-type-${k}`} className={cn('min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold', type === k ? 'border-navy bg-navy text-surface' : 'border-line bg-card text-navy hover:border-gold')}>{l}</button>)}</div></div>
      <FilterLayout search={<SearchField value={f.search} onChange={set('search')} placeholder="Search university, course, specialization..." />} panel={panel} activeCount={isProg ? active : [f.duration, f.mode].filter(Boolean).length} onReset={reset} count={(isProg ? q.isLoading : useCourses.isLoading) ? 'Loading' : type === 'pro' ? `${courses.length} professional course${courses.length === 1 ? '' : 's'} available` : type === 'cert' ? `${certs.length} certification${certs.length === 1 ? '' : 's'} available` : `${list.length} program${list.length === 1 ? '' : 's'} available`}>
        {type === 'pro' ? (
          useCourses.isError ? <ErrorState onRetry={useCourses.refetch} /> : useCourses.isLoading ? <CardSkeletons n={3} /> : !courses.length ? <EmptyState icon={GraduationCap} title="No professional courses match" body="Try clearing filters or search." /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{courses.map((c) => <CourseCard key={c.id} c={c} />)}</div>
        ) : type === 'cert' ? (
          useCerts.isError ? <ErrorState onRetry={useCerts.refetch} /> : useCerts.isLoading ? <CardSkeletons n={3} /> : !certs.length ? <EmptyState icon={GraduationCap} title="No verified certifications match" body="Only certifications confirmed with the issuer are listed." /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{certs.map((c) => <CertCard key={c.id} c={c} course={(useCourses.data || []).find((x) => x.id === c.courseId)} program={all.find((x) => x.id === c.programId)} />)}</div>
        ) : q.isLoading ? <CardSkeletons n={6} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? (
          <EmptyState icon={GraduationCap} title="No programs match these filters" body="Try removing a filter or searching a broader term." action={<button type="button" className="btn btn-navy" onClick={() => { setType('all'); setF((x) => ({ ...x, search: '', university: '', location: '', degree: '', degreeLevel: '', specialization: '', duration: '', mode: '', eligibility: '', fee: '' })); }}>Clear everything</button>} />
        ) : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <ProgramCard key={p.id} p={p} />)}</div>}
      </FilterLayout>
      <div className="container-x pb-4"><nav aria-label="Other learning paths" className="flex flex-wrap gap-2"><Link href="/professional-courses" className="btn btn-outline btn-sm">Professional courses</Link><Link href="/certifications" className="btn btn-outline btn-sm">Certifications</Link><Link href="/universities" className="btn btn-outline btn-sm">Universities</Link></nav></div>
      {has(disc) && null}
    </>
  );
}
