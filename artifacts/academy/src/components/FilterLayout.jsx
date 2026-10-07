import { useState } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Modal } from './Modal';
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
  const [open, setOpen] = useState(false);
  const body = (
    <div className="space-y-4">
      {panel}
      {activeCount > 0 && <button type="button" onClick={onReset} className="btn btn-outline btn-sm w-full">Reset {activeCount} filter{activeCount > 1 ? 's' : ''}</button>}
    </div>
  );
  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-6 flex gap-2">
        <div className="flex-1">{search}</div>
        <button type="button" onClick={() => setOpen(true)} className="btn btn-navy lg:hidden" data-testid="button-open-filters"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters{activeCount > 0 && <span className="rounded-full bg-gold px-1.5 text-xs text-navy">{activeCount}</span>}</button>
      </div>
      <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        <aside className="hidden lg:block"><div className="card-s sticky top-24 p-5"><p className="eyebrow mb-4">Refine</p>{body}</div></aside>
        <section aria-live="polite">
          <p className="mb-4 text-sm font-semibold text-muted-foreground" data-testid="text-result-count">{count}</p>
          {children}
        </section>
      </div>
      <Modal open={open} onOpenChange={setOpen} title="Filters" side="bottom">
        {body}
        <button type="button" onClick={() => setOpen(false)} className="btn btn-gold mt-5 w-full">Show results</button>
      </Modal>
    </div>
  );
}
