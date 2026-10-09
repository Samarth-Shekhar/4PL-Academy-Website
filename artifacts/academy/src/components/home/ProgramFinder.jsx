import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search, ArrowRight, X } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { has, programLevel, uniq } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Reveal, CardSkeletons, EmptyState } from '@/components/ui-kit';
import { ProgramCard } from '@/components/Cards';
import { FOCUS_PROGRAMS } from '@/lib/program-focus';
import { BrandSelect } from '@/components/BrandSelect';

const LEVELS = [['all', 'All levels'], ['ug', 'Undergraduate'], ['pg', 'Postgraduate']];
const rank = (p) => { const i = FOCUS_PROGRAMS.findIndex((f) => f.slug === p.slug); return i === -1 ? 99 : i; };

export function ProgramFinder({ s }) {
  const q = usePublicList('programs', undefined, { refetchOnWindowFocus: true });
  const [text, setText] = useState('');
  const [level, setLevel] = useState('all');
  const [uni, setUni] = useState('');
  const all = useMemo(() => q.data || [], [q.data]);
  const unis = useMemo(() => uniq(all.map((p) => p.universityName)), [all]);
  const list = useMemo(() => {
    const t = text.trim().toLowerCase();
    return all
      .filter((p) => (level === 'all' || programLevel(p) === level) && (!uni || p.universityName === uni) && (!t || `${p.name} ${p.universityName || ''} ${p.degree || ''} ${p.location || ''}`.toLowerCase().includes(t)))
      .sort((a, b) => rank(a) - rank(b) || Number(!!b.featured) - Number(!!a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [all, text, level, uni]);
  const dirty = text || level !== 'all' || uni;
  const preview = dirty ? list.slice(0, 6) : list.filter((p) => p.universityId && rank(p) === 99).slice(0, 3);
  return (
    <section className="py-14 sm:py-20" aria-labelledby="finder-h" data-testid="section-program-finder">
      <div className="container-x">
        <Reveal>
          <div className="finder-panel rounded-[1.75rem] p-5 sm:p-8">
            <p className="eyebrow mb-3">Find your program</p>
            <h2 id="finder-h" className="display-lg text-navy">{s?.name || 'Search the catalogue.'}</h2>
            {has(s?.shortDescription) && <p className="mt-3 max-w-2xl text-muted-foreground">{s.shortDescription}</p>}
            <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-6 grid gap-3 md:grid-cols-[1fr_16rem]">
              <label className="relative block"><span className="sr-only">Search programs</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/60" aria-hidden="true" />
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by program, university or city" className="input !rounded-full pl-11" data-testid="input-finder-search" /></label>
              <div><label htmlFor="finder-university" className="sr-only">University</label>
                <BrandSelect id="finder-university" value={uni} onChange={setUni} options={[{ value: '', label: 'All universities' }, ...unis]} placeholder="All universities" /></div>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Level">
              {LEVELS.map(([k, l]) => <button key={k} type="button" aria-pressed={level === k} onClick={() => setLevel(k)} className="pill-tab">{l}</button>)}
              {dirty && <button type="button" onClick={() => { setText(''); setLevel('all'); setUni(''); }} className="inline-flex min-h-10 items-center gap-1 px-2 text-sm font-bold text-gold-deep"><X className="h-4 w-4" aria-hidden="true" />Clear</button>}
              <span className="ml-auto text-sm text-muted-foreground" role="status">{q.isLoading ? 'Loading' : `${list.length} program${list.length === 1 ? '' : 's'}`}</span>
            </div>
          </div>
        </Reveal>
        <div className={cn('mt-8')}>
          {q.isLoading ? <CardSkeletons n={3} /> : q.isError ? <EmptyState title="Programs could not load" action={<button type="button" onClick={() => q.refetch()} className="btn btn-navy">Retry</button>} />
            : !list.length ? <EmptyState title="No program matches" body="Try a different word or clear the filters." action={<Link href="/book-counselling" className="btn btn-gold">Book Counselling</Link>} />
            : <>
               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{preview.map((p) => <ProgramCard key={p.id} p={p} />)}</div>
              <div className="mt-8 flex justify-center"><Link href={`/programs${text.trim() ? `?search=${encodeURIComponent(text.trim())}` : ''}`} className="btn btn-navy">Open full catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            </>}
        </div>
      </div>
    </section>
  );
}
