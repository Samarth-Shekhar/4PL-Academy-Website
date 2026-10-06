import { Link, useParams } from 'wouter';
import { ExternalLink, FileText, MapPin, Clock, Monitor, Wallet, BookOpen, CalendarDays, GraduationCap, Info, Mail, Phone, Globe, Award, Users2, Scale } from 'lucide-react';
import { usePublicItem, usePublicList } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { has, val, lines, initials, TBV } from '@/lib/format';
import { useCompare } from '@/lib/compare';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Skeleton, ErrorState, Fact, Reveal } from '@/components/ui-kit';
import { RichText, ListBlock } from '@/components/RichText';
import { FaqList } from '@/components/FaqList';
import { LeadForm } from '@/components/LeadForm';
import { ProgramCard } from '@/components/Cards';
import { bookHref } from '@/lib/booking';
import { BookButton, StickyBook } from '@/components/BookCta';
import { useUniMap } from '@/components/Cards';
import { mediaUrl } from '@/lib/home';
import NotFound from './NotFound';

function Shell({ q, crumbs, children }) {
  if (q.isLoading) return <div className="container-x space-y-4 py-10"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-52" /><Skeleton className="h-72" /></div>;
  if (q.isError) { const st = q.error?.status; if (st === 404) return <NotFound />; return <div className="container-x py-16"><ErrorState onRetry={q.refetch} /></div>; }
  if (!q.data) return <NotFound />;
  return children(q.data, crumbs);
}

function Hero({ c, crumbs, eyebrow, facts, children, logo }) {
  return (
    <header className="navy-surface on-navy">
      <div className="container-x pb-10 pt-6 sm:pb-14">
        <Breadcrumbs items={crumbs} light />
        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{eyebrow}</p>{c.featured && <span className="chip chip-gold">Featured</span>}</div>
            <div className="mt-3 flex items-start gap-4">
              {logo}
              <h1 className="text-[1.9rem] leading-[1.1] sm:text-5xl">{c.name}</h1>
            </div>
            {has(c.shortDescription) && <p className="mt-4 text-base leading-relaxed text-surface/80 sm:text-lg">{c.shortDescription}</p>}
          </div>
          {children && <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">{children}</div>}
        </div>
        {facts && <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 rounded-lg bg-surface p-4 text-navy sm:grid-cols-3 sm:p-5 lg:grid-cols-6">{facts}</div>}
      </div>
      <div className="h-1 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
    </header>
  );
}

const applyHref = (ctx) => bookHref(ctx).replace('/book-counselling', '/apply');

function Sidebar({ c, kind, ctx, extraLinks }) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="card-s p-5">
        <h2 className="text-xl text-navy">Talk to admissions</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Get guidance on eligibility, fees and next steps. Your selection is carried into the booking form.</p>
        <BookButton ctx={ctx} size="" className="w-full" testid={`button-book-${kind}`} />
        {kind === 'program' && <Link href={applyHref(ctx)} className="btn btn-outline mt-2 w-full" data-testid="link-apply-sidebar">Apply Now</Link>}
      </div>
      {(has(c.applicationUrl) || has(c.brochureUrl) || extraLinks) && <div className="card-s space-y-2 p-5">
        {has(c.applicationUrl) && <a href={c.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Official application page</a>}
        {has(c.brochureUrl) && <a href={c.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full"><FileText className="h-4 w-4" aria-hidden="true" /> Brochure</a>}
        {extraLinks}
      </div>}
    </aside>
  );
}

function Semesters({ semesters }) {
  const sems = (Array.isArray(semesters) ? semesters : []).filter((x) => has(x?.name) || lines(x?.modules).length);
  if (!sems.length) return null;
  return (
    <section className="mt-12" data-testid="section-semesters">
      <h2 className="text-2xl text-navy sm:text-3xl">Semester-wise curriculum</h2><div className="gold-rule mb-5 mt-3" />
      <div className="grid gap-4 sm:grid-cols-2">
        {sems.map((x, i) => (
          <details key={`${x.name}-${i}`} open={i < 2} className="card-s group p-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold text-navy [&::-webkit-details-marker]:hidden">{x.name || `Semester ${i + 1}`}<span className="chip">{lines(x.modules).length} modules</span></summary>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">{lines(x.modules).map((m) => <li key={m} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" /><span className="min-w-0 break-words">{m}</span></li>)}</ul>
          </details>
        ))}
      </div>
    </section>
  );
}

function Related({ p }) {
  const q = usePublicList('programs', { universityId: p.universityId }, { enabled: !!p.universityId });
  const list = (q.data || []).filter((x) => x.id !== p.id).slice(0, 4);
  if (!list.length) return null;
  return <section className="mt-12"><h2 className="text-2xl text-navy sm:text-3xl">Related programs</h2><div className="gold-rule mb-5 mt-3" /><div className="grid gap-5 sm:grid-cols-2">{list.map((x) => <ProgramCard key={x.id} p={x} />)}</div></section>;
}

function MediaStrip({ universityId }) {
  const q = usePublicList('media', { universityId }, { enabled: !!universityId });
  const list = (q.data || []).filter((m) => m.verified === true && has(m.url) && m.status !== 'archived').slice(0, 6);
  if (!list.length) return null;
  return (
    <section className="mt-12"><h2 className="text-2xl text-navy sm:text-3xl">Campus and student life</h2><div className="gold-rule mb-5 mt-3" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{list.map((m) => <li key={m.id} className="overflow-hidden rounded-lg border border-line bg-card">
        {m.type === 'video' ? <video src={mediaUrl(m.url)} poster={mediaUrl(m.posterUrl)} controls preload="none" className="aspect-video w-full object-cover" /> : <img src={mediaUrl(m.url)} alt={m.altText || m.name || ''} loading="lazy" className="aspect-video w-full object-cover" />}
        {has(m.caption) && <p className="p-2 text-xs text-muted-foreground">{m.caption}</p>}</li>)}</ul></section>
  );
}

const Unverified = ({ children = 'Detailed information for this listing is still being verified. Please speak to admissions for confirmed details.' }) => (
  <div className="flex gap-3 rounded-lg border border-gold/50 bg-gold-soft p-4 text-sm text-navy"><Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" /><p>{children}</p></div>
);

function Body({ c, sections }) {
  const any = has(c.description) || sections.some(([, items]) => items && items.length) || (c.faqs || []).length;
  return (
    <div>
      {has(c.description) ? <section><h2 className="text-2xl text-navy sm:text-3xl">Overview</h2><div className="gold-rule mb-4 mt-3" /><RichText text={c.description} /></section> : null}
      {sections.map(([title, items, numbered, cols]) => <ListBlock key={title} title={title} items={items} numbered={numbered} columns={cols} />)}
      <FaqList faqs={c.faqs} />
      {!any && <Unverified />}
    </div>
  );
}

export function ProgramDetail() {
  const { slug } = useParams();
  const q = usePublicItem('programs', slug);
    const cmp = useCompare();
  const unis = useUniMap();
  const c = q.data;
  useSeo({
    ...seoFrom(c, { title: 'Program', description: 'Program details' }), type: 'article',
    jsonLd: c && { '@context': 'https://schema.org', '@type': 'Course', name: c.name, description: c.shortDescription || c.description, provider: { '@type': 'EducationalOrganization', name: c.universityName || '4PL Academy' } },
  });
  return (
    <Shell q={q}>
      {(p) => {
        const uniOf = (x) => unis[x.universityId] || unis[x.universityName];
        const ctx = { program: p.name, university: has(p.universityName) ? p.universityName : undefined };
        return (
          <>
            <Hero c={p} eyebrow={[p.degree, p.degreeLevel].filter(has).join(' / ') || 'Degree program'} crumbs={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: p.name }]}
              facts={<>
                <Fact icon={Users2} label="University" value={uniOf(p) ? <Link href={`/universities/${uniOf(p).slug}`} className="underline">{p.universityName}</Link> : val(p.universityName)} /><Fact icon={MapPin} label="Location" value={val(p.location || p.city)} /><Fact icon={Clock} label="Duration" value={val(p.duration)} />
                <Fact icon={Monitor} label="Mode" value={val(p.mode)} /><Fact icon={BookOpen} label="Eligibility" value={val(p.eligibility)} /><Fact icon={Wallet} label="Fee" value={has(p.fee) ? `${p.fee}${has(p.feeNote) ? ` (${p.feeNote})` : ''}` : TBV} />
                <Fact icon={CalendarDays} label="Intake" value={val(p.intake || p.batch)} />{has(p.specialization) && <Fact icon={GraduationCap} label="Specialization" value={p.specialization} />}
              </>}>
              <BookButton ctx={ctx} size="" />
              <Link href={applyHref(ctx)} className="btn btn-light" data-testid="link-apply-now">Apply Now</Link>
              <button type="button" onClick={() => cmp.toggle(p.slug)} className="btn btn-light"><Scale className="h-4 w-4" aria-hidden="true" /> {cmp.has(p.slug) ? 'Remove from compare' : 'Add to compare'}</button>
            </Hero>
            <div className="container-x grid gap-10 py-10 pb-24 sm:py-14 lg:grid-cols-[1fr_22rem]">
              <div>
              <Body c={p} sections={[['Why choose this program', lines(p.highlights), false, true], ...(Array.isArray(p.semesters) && p.semesters.length ? [] : [['Curriculum', lines(p.curriculum), true]]), ['Learning outcomes', lines(p.outcomes)], ['Industry exposure', lines(p.industryExposure)], ['Projects', lines(p.projects)], ['Internships', lines(p.internships)], ['Career paths', lines(p.careerPaths), false, true], ['Facilities', lines(p.facilities), false, true], ['Admission process', lines(p.admissionProcess), true], ['Documents required', lines(p.documentsRequired)]]} />
              <Semesters semesters={p.semesters} />
              <MediaStrip universityId={p.universityId} />
              <Related p={p} />
              </div>
              <Sidebar c={p} kind="program" ctx={ctx} />
            </div>
            <StickyBook ctx={ctx} title={p.name} />
          </>
        );
      }}
    </Shell>
  );
}

export function UniversityDetail() {
  const { slug } = useParams();
  const q = usePublicItem('universities', slug);
    const c = q.data;
  const progs = usePublicList('programs', { universityId: c?.id }, { enabled: !!c?.id });
  useSeo({
    ...seoFrom(c, { title: 'University', description: 'University details' }),
    jsonLd: c && { '@context': 'https://schema.org', '@type': 'CollegeOrUniversity', name: c.name, description: c.shortDescription || c.description, url: c.websiteUrl || undefined, address: has(c.location) ? { '@type': 'PostalAddress', addressLocality: c.city || c.location, addressRegion: c.state, addressCountry: c.country || 'IN' } : undefined },
  });
  return (
    <Shell q={q}>
      {(u) => {
        const ctx = { university: u.name };
        const verified = !!u.partnershipVerified;
        return (
          <>
            <Hero c={u} eyebrow="University" crumbs={[{ label: 'Home', href: '/' }, { label: 'Universities', href: '/universities' }, { label: u.name }]}
              logo={<div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-surface sm:h-20 sm:w-20">{u.verified && has(u.logo) ? <img src={u.logo} alt={`${u.name} logo`} className="h-full w-full object-contain p-1" /> : <span className="font-display text-xl text-navy">{initials(u.name)}</span>}</div>}
              facts={<>
                <Fact icon={MapPin} label="Location" value={val(u.location || [u.city, u.state].filter(has).join(', '))} /><Fact icon={Users2} label="Type" value={val(u.type)} /><Fact icon={CalendarDays} label="Established" value={val(u.establishedYear)} />
                <Fact icon={Award} label="Accreditation" value={val(u.accreditation)} /><Fact icon={Globe} label="Country" value={val(u.country)} />
                <div className="col-span-2 flex items-center sm:col-span-1"><span className={`chip ${verified ? 'chip-ok' : 'chip-gold'}`}>{verified ? 'Verified 4PL partner' : 'Directory record'}</span></div>
              </>}>
              <BookButton ctx={ctx} size="" />
              {has(u.websiteUrl) && <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light"><ExternalLink className="h-4 w-4" aria-hidden="true" /> University website</a>}
            </Hero>
            <div className="container-x grid gap-10 py-10 pb-24 sm:py-14 lg:grid-cols-[1fr_22rem]">
              <div>
                {!verified && <div className="mb-8"><Unverified>This is a discovery record from our university directory. It does not confirm a partnership with 4PL Academy, and details are marked as information to be verified until confirmed.</Unverified></div>}
                <Body c={u} sections={[['Key highlights', lines(u.highlights), false, true], ['Facilities', lines(u.facilities), false, true], ['Student support', lines(u.studentSupport)], ['Industry exposure', lines(u.industryExposure)], ['Internships', lines(u.internships)], ['Career outcomes', lines(u.outcomes)], ['Verified placement information', u.verified ? lines(u.placementInformation) : []], ['Career paths', lines(u.careerPaths)], ['Admission process', lines(u.admissionProcess), true], ['Documents required', lines(u.documentsRequired)]]} />
                <MediaStrip universityId={u.id} />
                <section className="mt-12">
                  <h2 className="text-2xl text-navy sm:text-3xl">Programs listed</h2><div className="gold-rule mb-5 mt-3" />
                  {progs.isLoading ? <Skeleton className="h-40" /> : progs.isError ? <ErrorState onRetry={progs.refetch} /> : !(progs.data || []).length ? <Unverified>No programs are linked to this institution yet. Speak with admissions for available programs.</Unverified> : <div className="grid gap-5 sm:grid-cols-2">{progs.data.map((p) => <ProgramCard key={p.id} p={p} />)}</div>}
                </section>
                {(has(u.email) || has(u.phone)) && <section className="mt-12"><h2 className="text-2xl text-navy">Contact</h2><div className="gold-rule mb-4 mt-3" /><div className="space-y-2 text-sm">{has(u.email) && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold-deep" aria-hidden="true" /><a className="underline" href={`mailto:${u.email}`}>{u.email}</a></p>}{has(u.phone) && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-deep" aria-hidden="true" /><a className="underline" href={`tel:${u.phone}`}>{u.phone}</a></p>}</div></section>}
              </div>
              <Sidebar c={u} kind="university" ctx={ctx} />
            </div>
            <StickyBook ctx={ctx} title={u.name} />
          </>
        );
      }}
    </Shell>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  const q = usePublicItem('courses', slug);
    const c = q.data;
  useSeo({
    ...seoFrom(c, { title: 'Course', description: 'Course details' }),
    jsonLd: c && { '@context': 'https://schema.org', '@type': 'Course', name: c.name, description: c.shortDescription || c.description, provider: { '@type': 'EducationalOrganization', name: '4PL Academy' } },
  });
  return (
    <Shell q={q}>
      {(co) => {
        const ctx = { course: co.name };
        return (
          <>
            <Hero c={co} eyebrow={co.category || 'Professional course'} crumbs={[{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, { label: co.name }]}
              facts={<><Fact icon={Clock} label="Duration" value={val(co.duration)} /><Fact icon={Users2} label="Hours" value={val(co.hours)} /><Fact icon={Monitor} label="Mode" value={val(co.mode)} /><Fact icon={Wallet} label="Fee" value={val(co.fee)} /><Fact icon={BookOpen} label="Eligibility" value={val(co.eligibility)} /><Fact icon={Award} label="Certification" value={val(co.certification)} /></>}>
              <BookButton ctx={ctx} size="" />
            </Hero>
            <div className="container-x grid gap-10 py-10 pb-24 sm:py-14 lg:grid-cols-[1fr_22rem]">
              <div>
                {has(co.feeNote) && <p className="mb-6 rounded-lg bg-gold-soft p-4 text-sm text-navy">{co.feeNote}</p>}
                {has(co.targetAudience) && <details className="mb-8 rounded-lg border-l-4 border-gold bg-card p-4"><summary className="cursor-pointer font-semibold text-navy">Who it is for</summary><RichText text={co.targetAudience} className="mt-4" /></details>}
                <Body c={co} sections={[['Modules', lines(co.curriculum), true], ['Highlights', lines(co.highlights), false, true], ['Outcomes', lines(co.outcomes)]]} />
              </div>
              <Sidebar c={co} kind="course" ctx={ctx} extraLinks={<Link href="/professional-courses" className="btn btn-outline w-full">All courses</Link>} />
            </div>
            <StickyBook ctx={ctx} title={co.name} />
          </>
        );
      }}
    </Shell>
  );
}
void Reveal;
