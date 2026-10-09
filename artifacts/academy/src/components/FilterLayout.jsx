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
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input search-pill pl-11 pr-10" data-testid="input-search" />
      {value && <button type="button" onClick={() => onChange('')} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted-foreground" aria-label="Clear search"><X className="h-4 w-4" /></button>}
    </div>
  );
}
export function FilterLayout({ search, panel, activeCount, onReset, count, children }) {
  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-5">{search}</div>
      <details open className="filter-card group mb-8 p-4 sm:p-6" data-testid="section-refine-filters">
        <summary className="eyebrow mb-4 flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">Refine your search<span aria-hidden="true" className="text-lg transition-transform group-open:rotate-45">+</span></summary>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">{panel}</div>
        {activeCount > 0 && <button type="button" onClick={onReset} className="btn btn-outline btn-sm mt-5">Reset {activeCount} filter{activeCount > 1 ? 's' : ''}</button>}
      </details>
      <section aria-live="polite">
        <p className="mb-4 text-sm font-semibold text-muted-foreground" data-testid="text-result-count">{count}</p>
        {children}
      </section>
    </div>
  );
}
