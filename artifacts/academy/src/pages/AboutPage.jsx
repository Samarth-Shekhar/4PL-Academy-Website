import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { usePublicItem } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { useContactSettings, telHref } from '@/lib/settings';
import { asset, has, lines } from '@/lib/format';
import { mediaUrl } from '@/lib/home';
import { Reveal, Skeleton, ErrorState, EmptyState } from '@/components/ui-kit';
import { RichText, ListBlock } from '@/components/RichText';
import { FaqList } from '@/components/FaqList';
import { splitMarkdown } from '@/components/AboutSections';
import { cn } from '@/lib/cn';

const LOGO = asset('images/4pl-logo-trimmed.webp');
const HERO = asset('images/page-refresh/about-logistics-team.webp');
const FALLBACK_PHOTOS = [
  ['images/page-refresh/about-warehouse-discussion.webp', 'A team discussing warehouse operations'],
  ['images/page-refresh/about-practical-work.webp', 'Workers discussing inventory in a warehouse'],
  ['images/learning-refresh/student-perspectives.webp', 'Students sharing ideas while learning'],
  ['images/learning-refresh/shared-ideas.webp', 'Students collaborating on a project'],
  ['images/learning-refresh/student-projects.webp', 'Students working together'],
].map(([p, alt]) => ({ src: asset(p), alt }));
const clean = (t) => String(t || '').replace(/Admission\s*[–—-]\s*Training\s*[–—-]\s*Placement model/gi, 'approach');

function go(id, reduce) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('header')?.getBoundingClientRect().height || 80;
  const nav = window.matchMedia('(min-width: 1024px)').matches
    ? document.querySelector('[data-testid="about-nav"]')?.getBoundingClientRect().height || 0 : 0;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - nav - 24, behavior: reduce ? 'auto' : 'smooth' });
  el.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}

function Offices() {
  const st = useContactSettings();
  return (
    <section id="about-offices" tabIndex={-1} className="scroll-mt-40 border-t border-line py-12 sm:py-16">
      <h2 className="display-lg break-words text-navy">Our offices</h2>
      <div className="gold-rule mt-4" />
      <div className="mt-8">
        {st.isLoading ? <Skeleton className="h-40" /> : st.isError ? <ErrorState title="Office details are unavailable" /> : !st.offices.length ? (
          <EmptyState title="Office details coming soon" action={<Link href="/contact" className="btn btn-navy">Contact us</Link>} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {st.offices.map((o) => (
              <li key={o.id} className="card-s min-w-0 p-6 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none">
                <h3 className="break-words text-xl text-navy">{o.name}</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {has(o.address) && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><span className="whitespace-pre-line break-words">{o.address}</span></li>}
                  {has(o.email) && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><a href={`mailto:${o.email}`} className="break-all font-semibold text-navy underline">{o.email}</a></li>}
                  {o.phones.map((ph) => <li key={ph} className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><a href={telHref(ph)} className="font-semibold text-navy underline">{ph}</a></li>)}
                </ul>
                {has(o.address) && <a className="btn btn-outline btn-sm mt-5" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(o.address).replace(/\s*\n\s*/g, ', '))}`}>Get directions</a>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const q = usePublicItem('pages', 'about');
  const reduce = useReducedMotion();
  const p = q.data;
  const heroImg = (p && has(p.image) && mediaUrl(p.image)) || HERO;
  useSeo(seoFrom(p, { title: 'About 4PL Academy', description: 'The education and training arm of 4PL Consultancy Ltd.' }));
  const { intro, sections } = useMemo(() => splitMarkdown(clean(p?.description)), [p?.description]);
  const gallery = useMemo(() => (Array.isArray(p?.items) ? p.items : []).filter((g) => has(g?.image)).map((g) => ({ src: mediaUrl(g.image), alt: g.altText || '' })), [p?.items]);
  const photos = useMemo(() => { const seen = new Set([heroImg]); return [...gallery, ...FALLBACK_PHOTOS].filter((x) => !seen.has(x.src) && seen.add(x.src)); }, [gallery, heroImg]);
  const nav = useMemo(() => [...sections.map((s) => ({ id: s.id, title: s.title })), { id: 'about-offices', title: 'Our offices' }], [sections]);
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!sections.length) return undefined;
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: '-20% 0px -65% 0px' });
    nav.forEach((s) => { const n = document.getElementById(s.id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, [nav, sections.length]);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !sections.length) return;
    const f = requestAnimationFrame(() => go(id, true));
    return () => cancelAnimationFrame(f);
  }, [sections.length]);

  let photoIdx = 0;
  return (
    <div>
      <section className="navy-surface on-navy relative isolate overflow-hidden">
        <img src={heroImg} alt="" fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
        <div className="container-x py-16 sm:py-24 lg:py-32">
          <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <img src={LOGO} alt="4PL Academy: Creating Global Professionals" width="684" height="519" className="mb-6 h-24 w-auto rounded-xl bg-surface p-3" />
            <p className="eyebrow mb-5">About 4PL Academy</p>
            {q.isLoading ? <Skeleton className="h-24 max-w-2xl" /> : <h1 className="display-lg max-w-3xl break-words text-surface">{p?.name || 'About 4PL Academy'}</h1>}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-surface/80">{p?.shortDescription || 'The education and training arm of 4PL Consultancy Ltd, connecting university learning, practical industry expertise and professional growth across India and the UK.'}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/programs" className="btn btn-gold btn-hero">Explore programs</Link>
              <Link href="/contact" className="btn btn-hero btn-light">Contact us</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-x py-8">
        {q.isLoading ? <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-64" /></div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !p || !sections.length && !has(intro) ? (
          <EmptyState title="Content coming soon" body="This page is being prepared." action={<Link href="/contact" className="btn btn-navy">Contact us</Link>} />
        ) : (
          <>
            <nav aria-label="About page sections" data-testid="about-nav" className="z-30 -mx-1 border-y border-line bg-background/95 px-1 py-3 backdrop-blur lg:sticky lg:top-20">
              <ul className="flex flex-wrap gap-2">
                {nav.map((s) => (
                  <li key={s.id} className="max-w-full">
                    <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); setActive(s.id); go(s.id, reduce); }} aria-current={active === s.id ? 'true' : undefined}
                      className={cn('block max-w-full whitespace-normal break-words rounded-full border px-3 py-1.5 text-left text-xs font-bold leading-snug transition-colors sm:text-sm', active === s.id ? 'border-gold bg-gold text-navy' : 'border-navy/20 bg-white text-navy hover:border-gold hover:bg-gold/15')}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {has(intro) && <Reveal className="mt-10 max-w-3xl text-lg"><RichText text={intro} /></Reveal>}

            {sections.map((s, i) => {
              const photo = has(s.body) && s.body.length > 80 ? photos[photoIdx++] || null : null;
              const flip = photo && photoIdx % 2 === 0;
              return (
                <section key={s.id} id={s.id} tabIndex={-1} data-testid={`about-section-${i}`} className={cn('scroll-mt-40 py-10 sm:py-14', i === 0 ? 'mt-4' : 'border-t border-line', !has(s.body) && 'pb-0 sm:pb-0 border-t-0 pt-10')}>
                  <Reveal className={cn('grid min-w-0 gap-8', photo ? 'md:grid-cols-2 md:items-center' : 'max-w-4xl')}>
                    <div className={cn('min-w-0', flip && 'md:order-2')}>
                      <h2 className="display-lg break-words text-navy">{s.title}</h2>
                      <div className="gold-rule mt-4" />
                      {has(s.body) && <div className="mt-5"><RichText text={s.body} /></div>}
                    </div>
                    {photo && (
                      <figure className={cn('group min-w-0 overflow-hidden rounded-3xl bg-mist', flip && 'md:order-1')}>
                        <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                      </figure>
                    )}
                  </Reveal>
                </section>
              );
            })}

            <div className="border-t border-line pt-6">
              <ListBlock title="Highlights" items={lines(p.highlights)} columns />
              <ListBlock title="Learning pathway" items={lines(p.curriculum)} numbered />
              <ListBlock title="Outcomes" items={lines(p.outcomes)} />
              <ListBlock title="Career pathways" items={lines(p.careerPaths)} columns />
              <ListBlock title="Facilities" items={lines(p.facilities)} columns />
              <FaqList faqs={p.faqs} />
              {lines(p.media).length > 0 && <section className="mt-10"><h2 className="text-2xl text-navy">Media</h2><ul className="mt-3 space-y-1 text-sm">{lines(p.media).map((m, i) => <li key={i}><a className="break-all text-gold-deep underline" href={m} target="_blank" rel="noopener noreferrer">{m}</a></li>)}</ul></section>}
            </div>

            <Offices />

            <Reveal className="navy-surface on-navy rounded-3xl p-8 sm:p-12">
              <h2 className="display-lg text-surface">Talk to the 4PL Academy team</h2>
              <p className="mt-4 max-w-2xl text-surface/80">Explore programs, universities and partnership opportunities, or send us a message.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/contact" className="btn btn-gold btn-hero">Contact us <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/programs" className="btn btn-hero btn-light">Programs</Link>
                <Link href="/universities" className="btn btn-hero btn-light">Universities</Link>
                <Link href="/partner-with-us" className="btn btn-hero btn-light">Partner with us</Link>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </div>
  );
}
