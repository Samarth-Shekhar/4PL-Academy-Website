import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Clock, GraduationCap, MapPin, Monitor, Scale, Wallet, BookOpen, CalendarDays, Users2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { has, initials, fmtDate } from '@/lib/format';
import { usePublicList } from '@/lib/api';
import { BookButton } from './BookCta';
import { useCompare } from '@/lib/compare';

function Cover({ src, label, className }) {
  if (has(src)) return <img src={src} alt="" loading="lazy" decoding="async" className={cn('h-full w-full object-cover', className)} />;
  return (
    <div className="navy-surface grid h-full w-full place-items-center p-4 text-center">
      <span className="font-display text-xl leading-tight text-gold">{label}</span>
    </div>
  );
}

export function useUniMap() {
  const list = usePublicList('universities', undefined, { staleTime: 120000 }).data || [];
  return useMemo(() => { const m = {}; list.forEach((u) => { m[u.id] = u; m[u.name] = u; }); return m; }, [list]);
}

export function LogoBadge({ u, className }) {
  const [bad, setBad] = useState(false);
  if (has(u?.logo) && !bad) return <img src={u.logo} alt={`${u.name} logo`} loading="lazy" onError={() => setBad(true)} className={cn('object-contain', className)} />;
  return <span className={cn('grid place-items-center bg-mist font-display text-navy', className)} aria-hidden="true">{initials(u?.name)}</span>;
}

const Meta = ({ icon: I, children }) => has(children) ? <span className="flex min-w-0 items-center gap-1.5 text-sm text-foreground/80"><I className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><span className="truncate">{children}</span></span> : null;

export function ProgramCard({ p }) {
  const cmp = useCompare();
  const unis = useUniMap();
  const on = cmp.has(p.slug);
  const u = unis[p.universityId] || unis[p.universityName];
  const intake = p.intake || p.batch;
  const uname = u?.name || (has(p.universityName) ? p.universityName : '');
  return (
    <article className="card-s group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_18px_40px_-22px_hsl(221_76%_17%/.45)]" data-testid={`card-program-${p.id}`}>
      <div className="relative aspect-[16/9] overflow-hidden"><Cover src={p.image} label={p.degree || 'Program'} className="transition-transform duration-500 group-hover:scale-105" />
        {p.featured && <span className="chip chip-gold absolute left-3 top-3">Featured</span>}
        {u && has(u.logo) && <LogoBadge u={u} className="absolute bottom-2 right-2 h-11 w-11 rounded bg-surface p-1 shadow" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="min-h-4 truncate text-xs font-bold uppercase tracking-wider text-gold-deep">{has(uname) ? (u ? <Link href={`/universities/${u.slug}`} className="hover:underline">{uname}</Link> : uname) : null}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.8rem] text-lg leading-snug text-navy"><Link href={`/programs/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
        <p className="mt-2 flex flex-wrap gap-1.5">{[p.degreeLevel, p.degree].filter(has).map((x) => <span key={x} className="chip">{x}</span>)}</p>
        <div className="mt-3 grid gap-1.5">
          <Meta icon={Clock}>{p.duration}</Meta>
          <Meta icon={Monitor}>{p.mode}</Meta>
          <Meta icon={Wallet}>{p.fee}</Meta>
          <Meta icon={CalendarDays}>{intake}</Meta>
          <Meta icon={MapPin}>{p.location || p.city}</Meta>
        </div>
        <div className="mt-auto pt-4">
          <div className="flex gap-2">
            <Link href={`/programs/${p.slug}`} className="btn btn-navy btn-sm flex-1">View Program <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            <BookButton ctx={{ program: p.name, university: p.universityName }} className="flex-1" />
          </div>
          <label className={cn('mt-1 flex min-h-11 w-full cursor-pointer items-center gap-2 text-sm font-semibold', on ? 'text-gold-deep' : 'text-navy')}>
            <input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" checked={on} onChange={() => cmp.toggle(p.slug)} data-testid={`button-compare-${p.id}`} />
            <Scale className="h-4 w-4" aria-hidden="true" /> {on ? 'Selected to compare' : 'Select to compare (max 3)'}
          </label>
        </div>
      </div>
    </article>
  );
}

export function UniversityCard({ u }) {
  const verified = !!u.partnershipVerified;
  const loc = has(u.location || u.city) ? (u.location || [u.city, u.state].filter(has).join(', ')) : '';
  return (
    <Link href={`/universities/${u.slug}`} className="card-s group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-gold" data-testid={`card-university-${u.id}`}>
      <div className="relative aspect-[16/9] overflow-hidden">
        {has(u.image) ? <><Cover src={u.image} label={initials(u.name)} className="transition-transform duration-500 group-hover:scale-105" />{has(u.logo) && <LogoBadge u={u} className="absolute bottom-2 left-2 h-12 w-12 rounded border border-line bg-surface p-1 text-lg shadow" />}</>
          : has(u.logo) ? <div className="grid h-full w-full place-items-center bg-surface p-5"><LogoBadge u={u} className="max-h-full max-w-[70%] bg-surface text-3xl" /></div>
          : <Cover label={initials(u.name)} />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.8rem] text-lg leading-snug text-navy">{u.name}</h3>
        {loc && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{loc}</span></p>}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {has(u.type) && <span className="chip">{u.type}</span>}
          <span className={cn('chip', verified ? 'chip-ok' : 'chip-gold')}>{verified ? 'Verified 4PL partner' : 'Directory record'}</span>
          <ArrowUpRight className="ml-auto h-5 w-5 text-gold-deep transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function CourseCard({ c }) {
  return (
    <article className="card-s flex h-full flex-col overflow-hidden" data-testid={`card-course-${c.id}`}>
      <div className="aspect-[16/9] overflow-hidden"><Cover src={c.image} label={c.category || 'Professional course'} /></div>
      <div className="flex flex-1 flex-col p-4">
        {has(c.category) && <span className="chip chip-gold self-start">{c.category}</span>}
        <h3 className="mt-2 line-clamp-2 min-h-[2.8rem] text-lg leading-snug text-navy">{c.name}</h3>
        <div className="mt-3 grid gap-1.5">
          <Meta icon={Clock}>{c.duration}</Meta>
          <Meta icon={Monitor}>{c.mode}</Meta>
          <Meta icon={Wallet}>{c.fee}</Meta>
          <Meta icon={Users2}>{c.hours}</Meta>
        </div>
        <div className="mt-auto flex gap-2 pt-4"><Link href={`/professional-courses/${c.slug}`} className="btn btn-navy btn-sm flex-1">Course details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><BookButton ctx={{ course: c.name, interestedIn: 'Professional course' }} className="flex-1" /></div>
      </div>
    </article>
  );
}

export function BlogCard({ b }) {
  return (
    <Link href={`/blogs/${b.slug}`} className="story-card group flex h-full flex-col" data-testid={`card-blog-${b.id}`}>
      <div className="overflow-hidden rounded-2xl bg-mist">{has(b.image) ? <img src={b.image} alt="" loading="lazy" width={b.imageWidth} height={b.imageHeight} className="h-auto w-full object-contain" /> : <div className="aspect-[9/5]"><Cover label={b.category || 'Insights'} /></div>}</div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {has(b.category) && <span className="chip chip-gold">{b.category}</span>}
          {has(b.publishedAt) && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{fmtDate(b.publishedAt)}</span>}
        </div>
        <h3 className="mt-3 text-xl font-bold leading-snug text-navy group-hover:underline">{b.name}</h3>
        {has(b.shortDescription) && <p className="mt-2 line-clamp-3 text-sm text-foreground/75">{b.shortDescription}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-navy">Read article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function CertCard({ c, course, program }) {
  const ctx = { course: course?.name, program: program?.name, interestedIn: 'Certification' };
  return (
    <article className="card-s flex h-full flex-col overflow-hidden" data-testid={`card-certification-${c.id}`}>
      <div className="aspect-[16/9] overflow-hidden"><Cover src={c.image || c.logo} label={c.credentialType || 'Certification'} /></div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="chip chip-gold self-start">Certification</span>
        <h3 className="mt-2 text-xl leading-snug text-navy">{c.name}</h3>
        <div className="mt-3 grid gap-1.5">
          <Meta icon={Users2}>{c.issuer}</Meta>
          <Meta icon={BookOpen}>{c.credentialType}</Meta>
          <Meta icon={Clock}>{c.duration}</Meta>
        </div>
        {(course || program) && <p className="mt-3 text-sm text-muted-foreground">Related {course ? 'course' : 'program'}: <strong className="text-navy">{(course || program).name}</strong></p>}
        <div className="mt-auto flex gap-2 pt-4">
          {course ? <Link href={`/professional-courses/${course.slug}`} className="btn btn-navy btn-sm flex-1">View Course</Link> : program ? <Link href={`/programs/${program.slug}`} className="btn btn-navy btn-sm flex-1">View Program</Link> : <Link href="/certifications" className="btn btn-navy btn-sm flex-1">View Details</Link>}
          <BookButton ctx={ctx} className="flex-1" />
        </div>
      </div>
    </article>
  );
}
