import { useMemo, useState } from 'react';
import { Landmark } from 'lucide-react';
import { useGetDiscovery, getGetDiscoveryQueryKey } from '@workspace/api-client-react';
import { usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { uniq, parseFee, FEE_RANGES } from '@/lib/format';
import { PageHero, CardSkeletons, ErrorState, EmptyState } from '@/components/ui-kit';
import { FilterLayout, SelectField, SearchField } from '@/components/FilterLayout';
import { UniversityCard } from '@/components/Cards';

export default function Universities() {
  const empty={ search: '', location: '', degree: '', region:'', program:'', specialization:'', duration:'', mode:'', eligibility:'', fee:'', type: '', verified: '', sort: 'featured' };
  const [f, setF] = useState(empty);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  useSeo({ title: 'University Directory', description: 'Discover universities and colleges by city, state and degree. Directory entries are discovery records; verified 4PL partners are clearly marked.' });
  const disc = useGetDiscovery({ query: { queryKey: getGetDiscoveryQueryKey(), staleTime: 30000, refetchOnMount: true } }).data;
  const q = usePublicList('universities', { search: f.search.trim(), location: f.location, degree: f.degree });
  const programs=usePublicList('programs');
  const linked=programs.data||[];
  const programOptions=k=>uniq(linked.map(p=>p[k]));
  const all = q.data || [];
  const list = useMemo(() => {
    const hasProgramFilter=['program','specialization','duration','mode','eligibility','fee'].some(k=>f[k]);
    let r = all.filter((u) => (!f.region||u.category===f.region) && (!f.type || (u.type || '').toLowerCase() === f.type.toLowerCase()) && (!f.verified || (f.verified === 'yes' ? u.partnershipVerified : !u.partnershipVerified)) && (!hasProgramFilter || linked.some(p=>{
      if(p.universityId!==u.id)return false;
      if(['specialization','duration','mode','eligibility'].some(k=>f[k]&&p[k]!==f[k]))return false;
      if(f.program&&p.name!==f.program)return false;
      if(f.fee){const n=parseFee(p.fee);if(n===null||!FEE_RANGES.find(r=>r.id===f.fee)?.test(n))return false;}
      return true;
    })));
    r = [...r];
    if (f.sort === 'az') r.sort((a, b) => a.name.localeCompare(b.name));
    else r.sort((a, b) => Number(b.partnershipVerified) - Number(a.partnershipVerified) || Number(b.featured) - Number(a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return r;
  }, [all, linked, f]);
  const active = ['location', 'degree', 'region','program','specialization','duration','mode','eligibility','fee','type', 'verified'].filter((k) => f[k]).length;
  const reset = () => setF(x=>({...empty,search:x.search,sort:x.sort}));
  const panel = (
    <>
      <SelectField id="u-sort" label="Sort by" value={f.sort} onChange={set('sort')} any="Default" options={[{ value: 'featured', label: 'Verified and featured first' }, { value: 'az', label: 'Name A to Z' }]} />
      <SelectField id="u-loc" label="Location" value={f.location} onChange={set('location')} options={disc?.locations || []} />
      <SelectField id="u-deg" label="Degree" value={f.degree} onChange={set('degree')} options={disc?.degrees || []} />
      <SelectField id="u-region" label="Region" value={f.region} onChange={set('region')} options={uniq(all.map(u=>u.category))} />
      <SelectField id="u-program" label="Program" value={f.program} onChange={set('program')} options={programOptions('name')} />
      <SelectField id="u-specialization" label="Specialization" value={f.specialization} onChange={set('specialization')} options={programOptions('specialization')} />
      <SelectField id="u-duration" label="Duration" value={f.duration} onChange={set('duration')} options={programOptions('duration')} />
      <SelectField id="u-mode" label="Mode" value={f.mode} onChange={set('mode')} options={programOptions('mode')} />
      <SelectField id="u-eligibility" label="Eligibility" value={f.eligibility} onChange={set('eligibility')} options={programOptions('eligibility')} />
      <SelectField id="u-fee" label="Fee range" value={f.fee} onChange={set('fee')} options={FEE_RANGES.map(r=>({value:r.id,label:r.label}))} />
      <SelectField id="u-type" label="Institution type" value={f.type} onChange={set('type')} options={uniq(all.map((u) => u.type))} />
      <SelectField id="u-ver" label="Partnership" value={f.verified} onChange={set('verified')} options={[{ value: 'yes', label: 'Verified 4PL partners' }, { value: 'no', label: 'Directory records' }]} />
    </>
  );
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Universities' }]} eyebrow="University discovery" title="Explore universities and colleges" body="A discovery directory of institutions. A listing here is not a confirmed 4PL partnership; confirmed partners carry a verified badge and their logo." />
      <FilterLayout search={<SearchField value={f.search} onChange={set('search')} placeholder="Search by university, city or state" />} panel={panel} activeCount={active} onReset={reset} count={q.isLoading ? 'Loading universities' : `${list.length} institution${list.length === 1 ? '' : 's'} found`}>
        {q.isLoading || (programs.isLoading&&active>0) ? <CardSkeletons n={6} className="h-48" /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Landmark} title="No universities match" body="Try a different city, degree or search term." action={<button type="button" className="btn btn-navy" onClick={() => setF(empty)}>Clear everything</button>} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((u) => <UniversityCard key={u.id} u={u} />)}</div>}
      </FilterLayout>
    </>
  );
}
