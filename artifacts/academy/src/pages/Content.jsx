import { useMemo, useState } from 'react';
import { Link, useParams, useSearch } from 'wouter';
import { ArrowRight, CalendarDays, User, Mail, Phone, MapPin, Search } from 'lucide-react';
import { useContactSettings, telHref } from '@/lib/settings';
import { usePublicItem, usePublicList } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { has, lines, fmtDate, asset, uniq } from '@/lib/format';
import { PageHero, Skeleton, ErrorState, EmptyState, CardSkeletons } from '@/components/ui-kit';
import { RichText, ListBlock } from '@/components/RichText';
import { FaqList } from '@/components/FaqList';
import { BlogCard } from '@/components/Cards';
import { BookButton } from '@/components/BookCta';
import { LeadForm } from '@/components/LeadForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { OfficeLocationMap } from '@/components/OfficeLocationMap';
import NotFound from './NotFound';

const PAGE_IMG = { 'career-industry': 'images/industry-logistics.webp', 'student-life': 'images/student-life.webp', about: 'images/hero-students.webp', 'for-universities': 'images/industry-logistics.webp' };
const EYEBROW = { about: 'About 4PL Academy', 'career-industry': 'Career & industry', 'student-life': 'Student life', 'for-universities': 'For universities' };

export function KindPage({ slug }) {
  const q = usePublicItem('pages', slug);
  const p = q.data;
  useSeo({ ...seoFrom(p, { title: EYEBROW[slug] || slug, description: 'Information from 4PL Academy.' }) });
  const img = has(p?.image) ? p.image : asset(PAGE_IMG[slug] || 'images/hero-students.webp');
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: p?.name || EYEBROW[slug] || slug }]} eyebrow={EYEBROW[slug]} title={p?.name || EYEBROW[slug] || 'Loading'} body={p?.shortDescription} />
      <div className="container-x py-10 sm:py-14">
        {q.isLoading ? <div className="space-y-3"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-40" /></div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !p ? <EmptyState title="Content coming soon" body="This page is being prepared." /> : (
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
            <article>
              <img src={img} alt="" loading="lazy" className="mb-8 aspect-[16/7] w-full rounded-2xl object-cover" />
              {!has(p.image) && <p className="-mt-6 mb-8 text-[0.7rem] uppercase tracking-wider text-muted-foreground">Representative generic imagery</p>}
              <RichText text={p.description} />
              <ListBlock title="Highlights" items={lines(p.highlights)} columns />
              <ListBlock title="Learning pathway" items={lines(p.curriculum)} numbered />
              <ListBlock title="Outcomes" items={lines(p.outcomes)} />
              <ListBlock title="Career pathways" items={lines(p.careerPaths)} columns />
              <ListBlock title="Facilities" items={lines(p.facilities)} columns />
              <FaqList faqs={p.faqs} />
              {lines(p.media).length > 0 && <section className="mt-10"><h2 className="text-2xl text-navy">Media</h2><ul className="mt-3 space-y-1 text-sm">{lines(p.media).map((m, i) => <li key={i}><a className="text-gold-deep underline" href={m} target="_blank" rel="noopener noreferrer">{m}</a></li>)}</ul></section>}
            </article>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card-s p-5">
                <h2 className="text-xl text-navy">{slug === 'for-universities' ? 'Partner with 4PL Academy' : 'Speak with our team'}</h2>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">{slug === 'for-universities' ? 'Tell us about your institution and we will be in touch.' : 'Questions about programs or admissions? Leave your details.'}</p>
                <LeadForm category={slug === 'for-universities' ? 'partnership' : 'counselling'} idPrefix={`kp-${slug}`} submitLabel="Get in touch" />
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

const bdate = (b) => new Date(b.publishedAt || b.createdAt || 0).getTime() || 0;

export function Blogs() {
  const q = usePublicList('blogs');
  const [cat, setCat] = useState('');
  const [term, setTerm] = useState('');
  useSeo({ title: 'Blogs and Insights', description: 'Articles on education, careers, logistics and international trade from 4PL Academy.' });
  const all = useMemo(() => [...(q.data || [])].sort((a, b) => bdate(b) - bdate(a)), [q.data]);
  const cats = useMemo(() => uniq(all.map((b) => b.category)), [all]);
  const t = term.trim().toLowerCase();
  const filtered = all.filter((b) => (!cat || b.category === cat) && (!t || `${b.name} ${b.shortDescription || ''} ${b.author || ''} ${b.category || ''}`.toLowerCase().includes(t)));
  const feature = !cat && !t ? filtered[0] : null;
  const rows = feature ? filtered.slice(1) : filtered;
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs' }]} eyebrow="Insights" title="Blogs and insights" body="Reviewed articles on careers, universities and global trade." />
      <div className="container-x py-10 sm:py-14">
        {q.isLoading ? <CardSkeletons n={3} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !all.length ? <EmptyState title="No articles published yet" body="We only publish reviewed articles. Explore programs or ask ACAD BOT in the meantime." action={<Link href="/programs" className="btn btn-navy">Explore programs</Link>} /> : (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                <button type="button" className="pill-tab" aria-pressed={!cat} onClick={() => setCat('')}>All</button>
                {cats.map((c) => <button key={c} type="button" className="pill-tab" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
              </div>
              <div className="relative w-full lg:max-w-sm"><label htmlFor="blog-q" className="sr-only">Search articles</label><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="blog-q" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search articles" className="input rounded-full pl-10" /></div>
            </div>
            {feature && (
              <Link href={`/blogs/${feature.slug}`} className="story-card group mt-8 grid overflow-hidden rounded-[1.75rem] bg-mist/70 lg:grid-cols-2" data-testid="card-blog-featured">
                <div className="min-h-[14rem] overflow-hidden bg-navy">{has(feature.image) ? <img src={feature.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="navy-surface grid h-full min-h-[14rem] place-items-center p-6 text-center"><span className="font-display text-2xl text-gold">{feature.category || 'Featured story'}</span></div>}</div>
                <div className="flex min-w-0 flex-col justify-center p-6 sm:p-10">
                  <p className="eyebrow">Featured story</p>
                  <h2 className="mt-3 text-2xl font-extrabold leading-tight text-navy sm:text-4xl">{feature.name}</h2>
                  {has(feature.shortDescription) && <p className="mt-3 text-foreground/75">{feature.shortDescription}</p>}
                  <p className="mt-4 text-xs text-muted-foreground">{[feature.category, fmtDate(feature.publishedAt), feature.author].filter(has).join(' · ')}</p>
                  <span className="btn btn-navy mt-6 self-start">Read article <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
            )}
            {rows.length ? (
              <ul className="mt-10 divide-y divide-line">
                {rows.map((b) => (
                  <li key={b.id}><Link href={`/blogs/${b.slug}`} className="story-card group grid min-w-0 gap-4 py-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-8" data-testid={`card-blog-${b.id}`}>
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-navy">{has(b.image) ? <img src={b.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="navy-surface grid h-full place-items-center p-3 text-center"><span className="font-display text-gold">{b.category || 'Insights'}</span></div>}</div>
                    <div className="min-w-0 self-center">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{has(b.category) && <span className="chip chip-gold">{b.category}</span>}{has(b.publishedAt) && <span>{fmtDate(b.publishedAt)}</span>}{has(b.author) && <span>{b.author}</span>}</div>
                      <h3 className="mt-2 text-xl font-bold leading-snug text-navy group-hover:underline sm:text-2xl">{b.name}</h3>
                      {has(b.shortDescription) && <p className="mt-2 line-clamp-2 text-sm text-foreground/75">{b.shortDescription}</p>}
                    </div>
                  </Link></li>
                ))}
              </ul>
            ) : !feature && <div className="mt-8"><EmptyState title="No articles match" body="Try another category or search term." action={<button type="button" className="btn btn-outline btn-sm" onClick={() => { setCat(''); setTerm(''); }}>Clear filters</button>} /></div>}
          </>
        )}
      </div>
    </>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const q = usePublicItem('blogs', slug);
  const all = usePublicList('blogs');
  const b = q.data;
  useSeo({
    ...seoFrom(b, { title: 'Article' }), type: 'article',
    jsonLd: b && { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: b.name, datePublished: b.publishedAt || undefined, dateModified: b.updatedAt, author: { '@type': b.author ? 'Person' : 'Organization', name: b.author || '4PL Academy' }, image: b.image || undefined, publisher: { '@type': 'Organization', name: '4PL Academy' } },
  });
  const related = useMemo(() => {
    if (!b) return [];
    const others = (all.data || []).filter((x) => x.id !== b.id).sort((x, y) => bdate(y) - bdate(x));
    const same = others.filter((x) => has(b.category) && x.category === b.category);
    return [...same, ...others.filter((x) => !same.includes(x))].slice(0, 3);
  }, [all.data, b]);
  if (q.isLoading) return <div className="container-x space-y-4 py-12"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64" /></div>;
  if (q.isError && q.error?.status === 404) return <NotFound />;
  if (q.isError) return <div className="container-x py-16"><ErrorState onRetry={q.refetch} /></div>;
  if (!b) return <NotFound />;
  return (
    <>
      <article className="container-x max-w-3xl py-10 sm:py-14">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs' }, { label: b.name }]} />
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{has(b.category) && <span className="chip chip-gold">{b.category}</span>}{has(b.publishedAt) && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" aria-hidden="true" />{fmtDate(b.publishedAt)}</span>}{has(b.author) && <span className="flex items-center gap-1"><User className="h-4 w-4" aria-hidden="true" />{b.author}</span>}</div>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-5xl">{b.name}</h1>
        {has(b.shortDescription) && <p className="mt-4 text-lg text-foreground/75">{b.shortDescription}</p>}
        {has(b.image) && <img src={b.image} alt="" className="mt-8 h-auto w-full rounded-2xl" />}
        <div className="story-body mt-8"><RichText text={b.description} /></div>
        <FaqList faqs={b.faqs} />
        <div className="navy-surface on-navy mt-12 rounded-[1.5rem] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div><p className="font-display text-xl font-bold">Questions about your own options?</p><p className="mt-1 text-sm text-surface/75">Talk to an admissions counsellor about programs and next steps.</p></div>
          <div className="mt-4 sm:mt-0"><BookButton size="" ctx={{ interestedIn: 'Blog enquiry' }} className="btn-hero" /></div>
        </div>
        <Link href="/blogs" className="btn btn-outline mt-8"><ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" /> All articles</Link>
      </article>
      {related.length > 0 && (
        <section className="container-x pb-16" aria-labelledby="related-articles">
          <h2 id="related-articles" className="text-2xl font-extrabold text-navy sm:text-3xl">Related articles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <BlogCard key={r.id} b={r} />)}</div>
        </section>
      )}
    </>
  );
}

export function Faq() {
  const q = usePublicList('faqs');
  useSeo({
    title: 'Frequently Asked Questions', description: 'Answers about 4PL Academy programs, courses, admissions and counselling.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: (q.data || []).flatMap((c) => c.faqs || []).slice(0, 40).map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
  });
  const groups = (q.data || []).filter((c) => (c.faqs || []).length || has(c.description));
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} eyebrow="Help" title="Frequently asked questions" body="Straight answers about admission, training and placement support." />
      <div className="container-x max-w-4xl py-10 sm:py-14">
        {q.isLoading ? <Skeleton className="h-80" /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !groups.length ? <EmptyState title="No FAQs published yet" body="Ask ACAD BOT or contact our team." action={<Link href="/contact" className="btn btn-navy">Contact us</Link>} /> : groups.map((g) => (
          <section key={g.id} className="mb-10">
            <h2 className="text-2xl text-navy">{g.name}</h2>
            {has(g.shortDescription) && <p className="mt-1 text-sm text-muted-foreground">{g.shortDescription}</p>}
            <div className="gold-rule my-3" />
            <FaqList faqs={g.faqs} title="" />
          </section>
        ))}
      </div>
    </>
  );
}

const FORMS = {
  book: { title: "Let's Find the Right Program for You", eyebrow: 'Book Counselling', body: 'Tell us what you are exploring. Your selected program or university is already filled in. No guarantees, only honest guidance.', cat: 'counselling', label: 'Book Counselling' },
  contact: { title: 'Contact 4PL Academy', eyebrow: 'Contact', body: 'Questions about programs, courses or partnerships? Send us a message.', cat: 'contact', label: 'Send message' },
  apply: { title: 'Start your application', eyebrow: 'Apply', body: 'Tell us what you are interested in. Our admissions team will guide you through the process.', cat: 'application', label: 'Submit application interest' },
  counselling: { title: 'Request counselling', eyebrow: 'Counselling', body: 'A one-to-one conversation about programs, universities and admission support. No guarantees, only honest guidance.', cat: 'counselling', label: 'Request counselling' },
};
export function FormPage({ kind }) {
  const c = FORMS[kind];
  const sp = new URLSearchParams(useSearch());
  const ctx = { program: sp.get('program') || undefined, university: sp.get('university') || undefined, course: sp.get('course') || undefined, interestedIn: sp.get('interestedIn') || undefined };
  const st = useContactSettings();
  useSeo({ title: c.title, description: c.body });
  const page = usePublicItem('pages', kind === 'contact' ? 'contact' : '__none__', { enabled: kind === 'contact' }).data;
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: c.eyebrow }]} eyebrow={c.eyebrow} title={c.title} body={c.body} />
      <div className="container-x grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.2fr_1fr]">
        <div className="card-s p-5 sm:p-8"><LeadForm key={JSON.stringify(ctx)} category={c.cat} idPrefix={kind} submitLabel={c.label} {...ctx} /></div>
        <div className="space-y-5">
          {kind === 'contact' && (
            <div className="card-s p-5" data-testid="block-contact-details">
              <h2 className="text-xl text-navy">Contact details</h2>
              {st.offices.length ? <div className="mt-3 space-y-5">{st.offices.map((o) => (
                <section key={o.id} aria-label={o.name}><h3 className="text-base text-navy">{o.name}</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    {has(o.address) && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><span className="min-w-0 whitespace-pre-line break-words">{o.address}</span></li>}
                    {has(o.email) && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><a href={`mailto:${o.email}`} className="min-w-0 break-all underline">{o.email}</a></li>}
                    {o.phones.map((ph) => <li key={ph} className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><a href={telHref(ph)} className="underline">{ph}</a></li>)}
                  </ul></section>))}</div> : <p className="mt-2 text-sm text-muted-foreground">{st.isLoading ? 'Loading contact details' : 'Contact details are being verified. Please use the form and our team will reply.'}</p>}
            </div>
          )}
          {kind === 'contact' && <OfficeLocationMap />}
          {page && has(page.description) && <RichText text={page.description} />}
          <div className="navy-surface on-navy rounded-lg p-6"><p className="eyebrow">What happens next</p><ol className="mt-4 space-y-4">{['We review your request', 'An admissions advisor contacts you', 'You get verified information and next steps'].map((s, i) => <li key={s} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-navy">{i + 1}</span><span className="text-sm text-surface/90">{s}</span></li>)}</ol></div>
          <p className="text-xs text-muted-foreground">Admission, training and placement support is provided. Admission, jobs and salaries are never guaranteed.</p>
        </div>
      </div>
    </>
  );
}
