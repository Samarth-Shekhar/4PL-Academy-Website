import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, ChevronUp } from 'lucide-react';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Pic } from './shared';
import { BookButton } from '@/components/BookCta';

export function InteractiveProgramCard({ item, className }) {
  const [open, setOpen] = useState(false);
  const facts = (item.facts || []).filter(([, v]) => has(v));
  return (
    <article className={cn('group relative isolate overflow-hidden rounded-lg bg-navy text-surface', className)} data-testid={`card-showcase-${item.key}`}>
      <Pic src={item.image} alt="" label={item.title} className="absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-focus-within:scale-110" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/60 to-navy/0" aria-hidden="true" />
      <button type="button" className="absolute inset-0 z-10 w-full cursor-pointer" aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} details for ${item.title}`} onClick={() => setOpen((o) => !o)} />
      <div className="pointer-events-none relative flex h-full min-h-[18rem] flex-col justify-end p-5">
        {has(item.tag) && <span className="chip chip-gold mb-2 self-start">{item.tag}</span>}
        {has(item.image) && <span className="mb-2 text-[0.6rem] uppercase tracking-wider text-surface/70">Illustrative learning imagery</span>}
        <h3 className="text-2xl leading-tight text-surface">{item.title}</h3>
        {has(item.sub) && <p className="mt-1 text-sm text-surface/75">{item.sub}</p>}
        {has(item.line) && <p className="mt-2 text-xs text-surface/85">{item.line}</p>}
        {has(item.fee) && <p className="mt-1 text-xs font-semibold text-gold">{item.fee}{has(item.elig) ? ` / ${item.elig}` : ''}</p>}
        <span className="mt-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold group-hover:opacity-0" aria-hidden="true">Details <ChevronUp className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} /></span>
      </div>
      <div data-open={open} className="invisible absolute inset-x-0 bottom-0 z-20 translate-y-full bg-navy/95 p-5 backdrop-blur transition duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-hover:visible group-hover:translate-y-0 data-[open=true]:visible data-[open=true]:translate-y-0">
        <h3 className="text-lg leading-snug text-surface">{item.title}</h3>
        {facts.length > 0 && <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">{facts.map(([k, v]) => <div key={k}><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-gold">{k}</dt><dd className="text-surface/90">{v}</dd></div>)}</dl>}
        <div className="mt-4 flex gap-2"><Link href={item.href} className="btn btn-light btn-sm flex-1">View Program <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>{item.book && <BookButton ctx={item.book} className="flex-1" />}</div>
      </div>
    </article>
  );
}
