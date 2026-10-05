import { useState } from 'react';
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
import { Modal } from '@/components/Modal';
import { ProgramCard } from '@/components/Cards';
import { openBot } from '@/lib/events';
import NotFound from './NotFound';

function Shell({ q, crumbs, children }) {
  if (q.isLoading) return <div className="container-x space-y-4 py-10"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-52" /><Skeleton className="h-72" /></div>;
  if (q.isError) { const st = q.error?.status; if (st === 404) return <NotFound />; return <div className="container-x py-16"><ErrorState onRetry={q.refetch} /></div>; }
  if (!q.data) return <NotFound />;
  return children(q.data, crumbs);
}

function ApplyModal({ open, onOpenChange, ctx, category = 'application' }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={category === 'application' ? 'Start your application' : 'Request counselling'} description="Share your details and the admissions team will guide you through the next steps.">
      <LeadForm category={category} {...ctx} idPrefix="detail-modal" submitLabel="Submit request" />
    </Modal>
  );
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

function Sidebar({ c, kind, onApply, ctx, extraLinks }) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="card-s p-5">
        <h2 className="text-xl text-navy">Talk to admissions</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Get guidance on eligibility, fees and next steps.</p>
        <LeadForm category="counselling" {...ctx} idPrefix={`side-${kind}`} showMessage={false} submitLabel="Request a call back" />
      </div>
      <div className="card-s space-y-2 p-5">
        <button type="button" onClick={onApply} className="btn btn-gold w-full" data-testid="button-apply">Apply now</button>
        {has(c.applicationUrl) && <a href={c.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Official application page</a>}
        {has(c.brochureUrl) && <a href={c.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full"><FileText className="h-4 w-4" aria-hidden="true" /> Brochure</a>}
        <button type="button" onClick={() => openBot(`Tell me about ${c.name}`)} className="btn btn-outline w-full">Ask ACAD BOT</button>
        {extraLinks}
      </div>
    </aside>
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
  const [apply, setApply] = useState(false);
  const cmp = useCompare();
  const c = q.data;
  useSeo({
    ...seoFrom(c, { title: 'Program', description: 'Program details' }), type: 'article',
    jsonLd: c && { '@context': 'https://schema.org', '@type': 'Course', name: c.name, description: c.shortDescription || c.description, provider: { '@type': 'EducationalOrganization', name: c.universityName || '4PL Academy' } },
  });
  return (
    <Shell q={q}>
      {(p) => {
        const ctx = { program: p.name, university: has(p.universityName) ? p.universityName : undefined };
        return (
          <>
            <Hero c={p} eyebrow={[p.degree, p.degreeLevel].filter(has).join(' / ') || 'Degree program'} crumbs={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: p.name }]}
              facts={<>
                <Fact icon={Users2} label="University" value={val(p.universityName)} /><Fact icon={MapPin} label="Location" value={val(p.location || p.city)} /><Fact icon={Clock} label="Duration" value={val(p.duration)} />
                <Fact icon={Monitor} label="Mode" value={val(p.mode)} /><Fact icon={BookOpen} label="Eligibility" value={val(p.eligibility)} /><Fact icon={Wallet} label="Fee" value={has(p.fee) ? `${p.fee}${has(p.feeNote) ? ` (${p.feeNote})` : ''}` : TBV} />
                {has(p.batch) && <Fact icon={CalendarDays} label="Batch" value={p.batch} />}{has(p.specialization) && <Fact icon={GraduationCap} label="Specialization" value={p.specialization} />}
              </>}>
              <button type="button" onClick={() => setApply(true)} className="btn btn-gold">Apply now</button>
              <button type="button" onClick={() => cmp.toggle(p.slug)} className="btn btn-light"><Scale className="h-4 w-4" aria-hidden="true" /> {cmp.has(p.slug) ? 'Remove from compare' : 'Add to compare'}</button>
            </Hero>
            <div className="container-x grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_22rem]">
              <Body c={p} sections={[['Why choose this program', lines(p.highlights), false, true], ['Curriculum', lines(p.curriculum), true], ['Learning outcomes', lines(p.outcomes)], ['Industry exposure', lines(p.industryExposure)], ['Projects', lines(p.projects)], ['Internships', lines(p.internships)], ['Career paths', lines(p.careerPaths), false, true], ['Facilities', lines(p.facilities), false, true], ['Admission process', lines(p.admissionProcess), true], ['Documents required', lines(p.documentsRequired)]]} />
              <Sidebar c={p} kind="program" ctx={ctx} onApply={() => setApply(true)} />
            </div>
            <ApplyModal open={apply} onOpenChange={setApply} ctx={ctx} />
          </>
        );
      }}
    </Shell>
  );
}

export function UniversityDetail() {
  const { slug } = useParams();
  const q = usePublicItem('universities', slug);
  const [apply, setApply] = useState(false);
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
              logo={<div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-surface sm:h-20 sm:w-20">{verified && has(u.logo) ? <img src={u.logo} alt={`${u.name} logo`} className="h-full w-full object-contain p-1" /> : <span className="font-display text-xl text-navy">{initials(u.name)}</span>}</div>}
              facts={<>
                <Fact icon={MapPin} label="Location" value={val(u.location || [u.city, u.state].filter(has).join(', '))} /><Fact icon={Users2} label="Type" value={val(u.type)} /><Fact icon={CalendarDays} label="Established" value={val(u.establishedYear)} />
                <Fact icon={Award} label="Accreditation" value={val(u.accreditation)} /><Fact icon={Globe} label="Country" value={val(u.country)} />
                <div className="col-span-2 flex items-center sm:col-span-1"><span className={`chip ${verified ? 'chip-ok' : 'chip-gold'}`}>{verified ? 'Verified 4PL partner' : 'Directory record'}</span></div>
              </>}>
              <button type="button" onClick={() => setApply(true)} className="btn btn-gold">Apply / enquire</button>
              {has(u.websiteUrl) && <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light"><ExternalLink className="h-4 w-4" aria-hidden="true" /> University website</a>}
            </Hero>
            <div className="container-x grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_22rem]">
              <div>
                {!verified && <div className="mb-8"><Unverified>This is a discovery record from our university directory. It does not confirm a partnership with 4PL Academy, and details are marked as information to be verified until confirmed.</Unverified></div>}
                <Body c={u} sections={[['Key highlights', lines(u.highlights), false, true], ['Facilities', lines(u.facilities), false, true], ['Student support', lines(u.studentSupport)], ['Industry exposure', lines(u.industryExposure)], ['Internships', lines(u.internships)], ['Career outcomes', lines(u.outcomes)], ['Verified placement information', u.verified ? lines(u.placementInformation) : []], ['Career paths', lines(u.careerPaths)], ['Admission process', lines(u.admissionProcess), true], ['Documents required', lines(u.documentsRequired)]]} />
                <section className="mt-12">
                  <h2 className="text-2xl text-navy sm:text-3xl">Programs listed</h2><div className="gold-rule mb-5 mt-3" />
                  {progs.isLoading ? <Skeleton className="h-40" /> : progs.isError ? <ErrorState onRetry={progs.refetch} /> : !(progs.data || []).length ? <Unverified>No programs are linked to this institution yet. Speak with admissions for available programs.</Unverified> : <div className="grid gap-5 sm:grid-cols-2">{progs.data.map((p) => <ProgramCard key={p.id} p={p} />)}</div>}
                </section>
                {(has(u.email) || has(u.phone)) && <section className="mt-12"><h2 className="text-2xl text-navy">Contact</h2><div className="gold-rule mb-4 mt-3" /><div className="space-y-2 text-sm">{has(u.email) && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold-deep" aria-hidden="true" /><a className="underline" href={`mailto:${u.email}`}>{u.email}</a></p>}{has(u.phone) && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-deep" aria-hidden="true" /><a className="underline" href={`tel:${u.phone}`}>{u.phone}</a></p>}</div></section>}
              </div>
              <Sidebar c={u} kind="university" ctx={ctx} onApply={() => setApply(true)} />
            </div>
            <ApplyModal open={apply} onOpenChange={setApply} ctx={ctx} />
          </>
        );
      }}
    </Shell>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  const q = usePublicItem('courses', slug);
  const [apply, setApply] = useState(false);
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
              <button type="button" onClick={() => setApply(true)} className="btn btn-gold">Enrol interest</button>
            </Hero>
            <div className="container-x grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_22rem]">
              <div>
                {has(co.targetAudience) && <div className="mb-8 rounded-lg border-l-4 border-gold bg-card p-4"><p className="eyebrow">Who it is for</p><p className="mt-1 text-navy">{co.targetAudience}</p></div>}
                <Body c={co} sections={[['Modules', lines(co.curriculum), true], ['Highlights', lines(co.highlights), false, true], ['Outcomes', lines(co.outcomes)]]} />
              </div>
              <Sidebar c={co} kind="course" ctx={ctx} onApply={() => setApply(true)} extraLinks={<Link href="/courses" className="btn btn-outline w-full">All courses</Link>} />
            </div>
            <ApplyModal open={apply} onOpenChange={setApply} ctx={ctx} category="counselling" />
          </>
        );
      }}
    </Shell>
  );
}
void Reveal;
