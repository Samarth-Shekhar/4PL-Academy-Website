import { Search, X } from 'lucide-react';
import { BrandSelect } from './BrandSelect';

export function SelectField({ label, value, onChange, options, any = 'Any', id }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <BrandSelect id={id} value={value} onChange={onChange} placeholder={any} options={[{ value: '', label: any }, ...options]} />
    </div>
  );
}
export function SearchField({ value, onChange, placeholder, id = 'search' }) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>Search</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-10 pr-10" data-testid="input-search" />
      {value && <button type="button" onClick={() => onChange('')} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted-foreground" aria-label="Clear search"><X className="h-4 w-4" /></button>}
    </div>
  );
}
export function FilterLayout({ search, panel, activeCount, onReset, count, children }) {
  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-5">{search}</div>
      <section aria-label="Refine results" data-testid="section-refine-filters" className="card-s mb-8 p-4 sm:p-6">
        <p className="eyebrow mb-4">Refine your search</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{panel}</div>
        {activeCount > 0 && <button type="button" onClick={onReset} className="btn btn-outline btn-sm mt-5">Reset {activeCount} filter{activeCount > 1 ? 's' : ''}</button>}
      </section>
      <section aria-live="polite">
        <p className="mb-4 text-sm font-semibold text-muted-foreground" data-testid="text-result-count">{count}</p>
        {children}
      </section>
    </div>
  );
}
