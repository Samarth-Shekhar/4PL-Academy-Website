import { useMemo } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Clock, GraduationCap, MapPin, Monitor, Scale, Wallet, BookOpen, CalendarDays, Users2, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { has, val, lines, initials, fmtDate, TBV } from '@/lib/format';
import { usePublicList } from '@/lib/api';
import { BookButton } from './BookCta';
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

export function useUniMap() {
  const list = usePublicList('universities', undefined, { staleTime: 120000 }).data || [];
  return useMemo(() => { const m = {}; list.forEach((u) => { m[u.id] = u; m[u.name] = u; }); return m; }, [list]);
}

export function ProgramCard({ p }) {
  const cmp = useCompare();
  const unis = useUniMap();
  const on = cmp.has(p.slug);
  const u = unis[p.universityId] || unis[p.universityName];
  const ok = !!u?.verified && has(u?.logo);
  const hl = lines(p.highlights).slice(0, 4);
  const intake = p.intake || p.batch;
  return (
    <article className="card-s group flex flex-col overflow-hidden transition-shadow hover:shadow-[0_18px_40px_-22px_hsl(221_76%_17%/.45)]" data-testid={`card-program-${p.id}`}>
      <div className="relative h-36 overflow-hidden"><Cover src={p.image} label={p.degree || 'Program'} className="transition-transform duration-500 group-hover:scale-105" />
        {p.featured && <span className="chip chip-gold absolute left-3 top-3">Featured</span>}
        {ok && <img src={u.logo} alt={`${u.name} logo`} loading="lazy" className="absolute bottom-2 right-2 h-11 w-11 rounded bg-surface object-contain p-1 shadow" />}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-deep">
          {u ? <Link href={`/universities/${u.slug}`} className="hover:underline">{u.name}</Link> : has(p.universityName) ? p.universityName : 'University to be verified'}
          {has(p.location || p.city) && <span className="font-medium normal-case tracking-normal text-muted-foreground"> &middot; {p.location || p.city}</span>}
        </p>
        <h3 className="mt-1.5 text-xl leading-snug text-navy"><Link href={`/programs/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
        <p className="mt-2 flex flex-wrap gap-1.5">{[p.degreeLevel, p.degree, p.duration, p.mode].filter(has).map((x) => <span key={x} className="chip">{x}</span>)}</p>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
          <Fact icon={Wallet} label="Fees" value={has(p.fee) ? p.fee : TBV} />
          <Fact icon={CalendarDays} label="Intake" value={val(intake)} />
          <Fact icon={Clock} label="Duration" value={val(p.duration)} />
          <Fact icon={Monitor} label="Mode" value={val(p.mode)} />
          <div className="col-span-2"><Fact icon={MapPin} label="Location" value={val(p.location || p.city || u?.location || u?.city)} /></div>
          <div className="col-span-2"><Fact icon={BookOpen} label="Eligibility" value={val([p.eligibility, has(p.minimumPercentage) ? `Minimum ${p.minimumPercentage}${/^\d+(\.\d+)?$/.test(String(p.minimumPercentage).trim()) ? '%' : ''}` : ''].filter(has).join(' · '))} /></div>
        </div>
        {has(p.feeNote) && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.feeNote}</p>}
        {hl.length > 0 && <ul className="mt-4 space-y-1 text-sm text-foreground/80">{hl.map((h) => <li key={h} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><span className="min-w-0 break-words">{h}</span></li>)}</ul>}
        <div className="mt-5 flex flex-1 flex-wrap items-end gap-2">
          <Link href={`/programs/${p.slug}`} className="btn btn-navy btn-sm flex-1">View Program <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          <BookButton ctx={{ program: p.name, university: p.universityName }} className="flex-1" />
          <label className={cn('flex min-h-11 w-full cursor-pointer items-center gap-2 text-sm font-semibold', on ? 'text-gold-deep' : 'text-navy')}>
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
  const showLogo = !!u.verified && has(u.logo);
  return (
    <Link href={`/universities/${u.slug}`} className="card-s group flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:border-gold sm:p-5" data-testid={`card-university-${u.id}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">
          {showLogo ? <img src={u.logo} alt={`${u.name} logo`} className="h-full w-full object-contain p-1" loading="lazy" /> : <span className="font-display text-lg text-navy">{initials(u.name)}</span>}
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
        <div className="mt-5 flex flex-wrap gap-2"><Link href={`/professional-courses/${c.slug}`} className="btn btn-navy btn-sm flex-1">Course details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><BookButton ctx={{ course: c.name, interestedIn: 'Professional course' }} className="flex-1" /></div>
      </div>
    </article>
  );
}

export function BlogCard({ b }) {
  return (
    <Link href={`/blogs/${b.slug}`} className="story-card group flex h-full flex-col" data-testid={`card-blog-${b.id}`}>
      <div className="aspect-[4/3] overflow-hidden rounded-2xl"><Cover src={b.image} label={b.category || 'Insights'} className="transition-transform duration-700 group-hover:scale-105" /></div>
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
    <article className="card-s flex flex-col overflow-hidden" data-testid={`card-certification-${c.id}`}>
      <div className="h-28"><Cover src={c.image || c.logo} label={c.credentialType || 'Certification'} /></div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="chip chip-gold self-start">Certification</span>
        <h3 className="mt-2 text-xl leading-snug text-navy">{c.name}</h3>
        {has(c.shortDescription) && <p className="mt-2 line-clamp-3 text-sm text-foreground/75">{c.shortDescription}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Fact icon={Users2} label="Issuer" value={val(c.issuer)} />
          <Fact icon={BookOpen} label="Type" value={val(c.credentialType)} />
          <Fact icon={Clock} label="Duration" value={val(c.duration)} />
        </div>
        {(course || program) && <p className="mt-3 text-sm text-muted-foreground">Related {course ? 'course' : 'program'}: <strong className="text-navy">{(course || program).name}</strong></p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {course ? <Link href={`/professional-courses/${course.slug}`} className="btn btn-navy btn-sm flex-1">View Course</Link> : program ? <Link href={`/programs/${program.slug}`} className="btn btn-navy btn-sm flex-1">View Program</Link> : <Link href="/certifications" className="btn btn-navy btn-sm flex-1">View Details</Link>}
          <BookButton ctx={ctx} className="flex-1" />
        </div>
      </div>
    </article>
  );
}
