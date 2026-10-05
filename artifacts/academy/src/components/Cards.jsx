import { Link } from 'wouter';
import { ArrowUpRight, Clock, GraduationCap, MapPin, Monitor, Scale, Wallet, BookOpen, CalendarDays, Users2, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { has, val, initials, fmtDate, TBV } from '@/lib/format';
import { useCompare } from '@/lib/compare';
import { Fact } from './ui-kit';

function Cover({ src, label, className }) {
  if (has(src)) return <img src={src} alt="" loading="lazy" decoding="async" className={cn('h-full w-full object-cover', className)} />;
  return (
    <div className="navy-surface grid h-full w-full place-items-center p-4 text-center">
      <span className="font-display text-xl leading-tight text-gold">{label}</span>
    </div>
  );
}

export function ProgramCard({ p }) {
  const cmp = useCompare();
  const on = cmp.has(p.slug);
  return (
    <article className="card-s group flex flex-col overflow-hidden transition-shadow hover:shadow-[0_18px_40px_-22px_hsl(221_76%_17%/.45)]" data-testid={`card-program-${p.id}`}>
      <div className="relative h-36 overflow-hidden"><Cover src={p.image} label={p.degree || 'Program'} className="transition-transform duration-500 group-hover:scale-105" />
        {p.featured && <span className="chip chip-gold absolute left-3 top-3">Featured</span>}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-deep">{has(p.universityName) ? p.universityName : 'University to be confirmed'}</p>
        <h3 className="mt-1.5 text-xl leading-snug text-navy">{p.name}</h3>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
          <Fact icon={GraduationCap} label="Degree" value={val(p.degree)} />
          <Fact icon={MapPin} label="Location" value={val(p.location || p.city)} />
          <Fact icon={Clock} label="Duration" value={val(p.duration)} />
          <Fact icon={Monitor} label="Mode" value={val(p.mode)} />
          <Fact icon={Wallet} label="Fee" value={val(p.fee)} />
          <Fact icon={BookOpen} label="Eligibility" value={val(p.eligibility)} />
        </div>
        <div className="mt-5 flex flex-1 items-end gap-2">
          <Link href={`/programs/${p.slug}`} className="btn btn-navy btn-sm flex-1">View details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          <button type="button" onClick={() => cmp.toggle(p.slug)} aria-pressed={on} className={cn('btn btn-sm', on ? 'btn-gold' : 'btn-outline')} data-testid={`button-compare-${p.id}`}>
            {on ? <Check className="h-4 w-4" aria-hidden="true" /> : <Scale className="h-4 w-4" aria-hidden="true" />} Compare
          </button>
        </div>
      </div>
    </article>
  );
}

export function UniversityCard({ u }) {
  const verified = !!u.partnershipVerified;
  return (
    <Link href={`/universities/${u.slug}`} className="card-s group flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:border-gold sm:p-5" data-testid={`card-university-${u.id}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">
          {verified && has(u.logo) ? <img src={u.logo} alt={`${u.name} logo`} className="h-full w-full object-contain p-1" loading="lazy" /> : <span className="font-display text-lg text-navy">{initials(u.name)}</span>}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg leading-snug text-navy">{u.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{has(u.location || u.city) ? (u.location || [u.city, u.state].filter(has).join(', ')) : TBV}</span></p>
        </div>
      </div>
      {has(u.shortDescription) && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/75">{u.shortDescription}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {has(u.type) && <span className="chip">{u.type}</span>}
        <span className={cn('chip', verified ? 'chip-ok' : 'chip-gold')}>{verified ? 'Verified 4PL partner' : 'Directory record'}</span>
        <ArrowUpRight className="ml-auto h-5 w-5 text-gold-deep transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function CourseCard({ c }) {
  return (
    <article className="card-s flex flex-col overflow-hidden" data-testid={`card-course-${c.id}`}>
      <div className="h-28"><Cover src={c.image} label={c.category || 'Professional course'} /></div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {has(c.category) && <span className="chip chip-gold self-start">{c.category}</span>}
        <h3 className="mt-2 text-xl leading-snug text-navy">{c.name}</h3>
        {has(c.shortDescription) && <p className="mt-2 line-clamp-3 text-sm text-foreground/75">{c.shortDescription}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Fact icon={Clock} label="Duration" value={val(c.duration)} />
          <Fact icon={Wallet} label="Fee" value={val(c.fee)} />
          <Fact icon={Monitor} label="Mode" value={val(c.mode)} />
          <Fact icon={Users2} label="Hours" value={val(c.hours)} />
        </div>
        <Link href={`/courses/${c.slug}`} className="btn btn-navy btn-sm mt-5 w-full">Course details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

export function BlogCard({ b }) {
  return (
    <Link href={`/blogs/${b.slug}`} className="card-s group flex h-full flex-col overflow-hidden transition hover:border-gold" data-testid={`card-blog-${b.id}`}>
      <div className="h-44 overflow-hidden"><Cover src={b.image} label={b.category || 'Insights'} className="transition-transform duration-500 group-hover:scale-105" /></div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {has(b.category) && <span className="chip chip-gold">{b.category}</span>}
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{fmtDate(b.publishedAt || b.createdAt)}</span>
        </div>
        <h3 className="mt-3 text-xl leading-snug text-navy">{b.name}</h3>
        {has(b.shortDescription) && <p className="mt-2 line-clamp-3 text-sm text-foreground/75">{b.shortDescription}</p>}
        <span className="mt-auto pt-4 text-sm font-semibold text-gold-deep">Read article</span>
      </div>
    </Link>
  );
}
