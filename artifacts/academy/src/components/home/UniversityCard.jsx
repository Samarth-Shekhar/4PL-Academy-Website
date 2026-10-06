import { Link } from 'wouter';
import { ArrowUpRight, MapPin, ShieldCheck } from 'lucide-react';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { LogoBadge } from '@/components/Cards';

export function UniversityCard({ u, programs = [], active, onFocus }) {
  return (
    <article className={cn('rounded-lg border bg-card p-4 transition', active ? 'border-gold shadow-[0_14px_30px_-20px_hsl(221_76%_17%/.6)]' : 'border-line')} data-testid={`card-network-university-${u.id}`}>
      <button type="button" onClick={onFocus} className="block w-full text-left" aria-pressed={!!active}>
        <span className="flex items-start gap-3"><LogoBadge u={u} className="h-11 w-11 shrink-0 rounded border border-line bg-surface p-1 text-base" /><h4 className="font-display text-lg leading-snug text-navy">{u.name}</h4></span>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-gold-deep" aria-hidden="true" />{[u.city, u.state].filter(has).join(', ') || 'Location to be confirmed'}</p>
      </button>
      {u.partnershipVerified && <span className="chip chip-ok mt-2"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Verified 4PL partner</span>}
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gold-deep">Programs in the catalog</p>
        {programs.length ? <ul className="mt-1.5 space-y-1">{programs.slice(0, 4).map((p) => <li key={p.id}><Link href={`/programs/${p.slug}`} className="text-sm font-semibold text-navy underline-offset-4 hover:underline">{p.name}</Link></li>)}{programs.length > 4 && <li className="text-xs text-muted-foreground">and {programs.length - 4} more</li>}</ul> : <p className="mt-1 text-sm text-muted-foreground">No linked programs yet.</p>}
      </div>
      <Link href={`/universities/${u.slug}`} className="btn btn-navy btn-sm mt-3 w-full">View University <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
    </article>
  );
}
