import { Link } from 'wouter';
import { Scale, X } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { useCompare } from '@/lib/compare';
import { useSeo } from '@/lib/seo';
import { val, lines } from '@/lib/format';
import { PageHero, Skeleton, EmptyState, ErrorState } from '@/components/ui-kit';

const ROWS = [
  ['University', (p) => val(p.universityName)], ['Program', (p) => p.name], ['Degree', (p) => val(p.degree)], ['Location', (p) => val(p.location || p.city)],
  ['Duration', (p) => val(p.duration)], ['Fee', (p) => val(p.fee)], ['Eligibility', (p) => val(p.eligibility)], ['Mode', (p) => val(p.mode)],
  ['Specialization', (p) => val(p.specialization)], ['Intake', (p) => val(p.intake || p.batch)], ['Curriculum', (p) => (Array.isArray(p.semesters) && p.semesters.length ? p.semesters.map((x) => `${x.name}: ${lines(x.modules).join(', ')}`).join(' | ') : lines(p.curriculum).join(', ') || val(''))], ['Career paths', (p) => (lines(p.careerPaths).join(', ') || val(''))],
];

export default function Compare() {
  useSeo({ title: 'Compare Programs', description: 'Compare two or three degree programs side by side on university, fee, duration, eligibility and mode.' });
  const cmp = useCompare();
  const q = usePublicList('programs');
  const items = cmp.ids.map((s) => (q.data || []).find((p) => p.slug === s)).filter(Boolean);
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: 'Compare' }]} eyebrow="Compare" title="Programs side by side" body="Select two or three programs from the program list. Fields still to be verified show as such rather than guessed." />
      <div className="container-x py-10">
        {q.isLoading ? <Skeleton className="h-80" /> : q.isError ? <ErrorState onRetry={q.refetch} /> : items.length < 2 ? (
          <EmptyState icon={Scale} title={items.length ? 'Add one more program' : 'Nothing to compare yet'} body="Use the Compare button on any program card. You can compare up to three." action={<Link href="/programs" className="btn btn-navy">Choose programs</Link>} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Program comparison</caption>
                <thead><tr><th className="w-40 p-3" scope="col"><span className="sr-only">Field</span></th>{items.map((p) => <th key={p.id} scope="col" className="navy-surface on-navy min-w-[14rem] p-4 align-top font-display text-lg font-medium">{p.name}<button type="button" onClick={() => cmp.remove(p.slug)} className="mt-2 flex items-center gap-1 font-sans text-xs text-gold"><X className="h-3 w-3" aria-hidden="true" /> Remove</button></th>)}</tr></thead>
                <tbody>{ROWS.map(([l, fn], i) => <tr key={l} className={i % 2 ? 'bg-mist/50' : 'bg-card'}><th scope="row" className="p-3 text-xs font-bold uppercase tracking-wider text-gold-deep">{l}</th>{items.map((p) => <td key={p.id} className="border-l border-line p-3 font-medium text-navy">{fn(p)}</td>)}</tr>)}
                  <tr><th scope="row" className="p-3" />{items.map((p) => <td key={p.id} className="border-l border-line p-3"><Link href={`/programs/${p.slug}`} className="btn btn-gold btn-sm">View program</Link></td>)}</tr></tbody>
              </table>
            </div>
            <div className="space-y-5 md:hidden">
              {items.map((p) => (
                <article key={p.id} className="card-s overflow-hidden">
                  <div className="navy-surface on-navy flex items-start justify-between gap-3 p-4"><h2 className="text-xl">{p.name}</h2><button type="button" onClick={() => cmp.remove(p.slug)} aria-label={`Remove ${p.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded hover:bg-surface/10"><X className="h-4 w-4" /></button></div>
                  <dl className="divide-y divide-line">{ROWS.map(([l, fn]) => <div key={l} className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-2.5"><dt className="text-xs font-bold uppercase tracking-wider text-gold-deep">{l}</dt><dd className="min-w-0 break-words text-sm font-medium text-navy">{fn(p)}</dd></div>)}</dl>
                  <div className="p-4"><Link href={`/programs/${p.slug}`} className="btn btn-gold btn-sm w-full">View program</Link></div>
                </article>
              ))}
            </div>
            <button type="button" onClick={cmp.clear} className="btn btn-outline mt-6">Clear comparison</button>
          </>
        )}
      </div>
    </>
  );
}
