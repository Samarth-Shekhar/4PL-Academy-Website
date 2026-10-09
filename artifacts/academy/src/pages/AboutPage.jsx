import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { usePublicItem } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { useContactSettings, telHref } from '@/lib/settings';
import { asset, has, lines } from '@/lib/format';
import { mediaUrl } from '@/lib/home';
import { Reveal, Skeleton, ErrorState, EmptyState, SplitHero } from '@/components/ui-kit';
import { RichText, ListBlock } from '@/components/RichText';
import { FaqList } from '@/components/FaqList';
import { splitMarkdown } from '@/components/AboutSections';
import { cn } from '@/lib/cn';

const LOGO = asset('images/4pl-logo-trimmed.webp');
const HERO = asset('images/page-refresh/about-logistics-team.webp');
const FALLBACK_PHOTOS = [
  ['images/page-refresh/about-warehouse-discussion.webp', 'A team discussing warehouse operations'],
  ['images/editorial/classroom.webp', 'A classroom learning setting'],
  ['images/editorial/port.webp', 'A container port in operation'],
  ['images/learning-refresh/student-perspectives.webp', 'Students sharing ideas while learning'],
  ['images/editorial/business.webp', 'A business meeting setting'],
  ['images/page-refresh/about-practical-work.webp', 'Workers discussing inventory in a warehouse'],
  ['images/editorial/technology.webp', 'A person working on computer code'],
  ['images/learning-refresh/shared-ideas.webp', 'Students collaborating on a project'],
  ['images/editorial/trade.webp', 'Global trade and shipping'],
  ['images/learning-refresh/build.webp', 'Computer code on a screen'],
  ['images/editorial/warehouse.webp', 'A warehouse interior'],
  ['images/learning-refresh/student-projects.webp', 'Students working together'],
  ['images/learning-refresh/experience.webp', 'A ship beside a waterfront building'],
  ['images/learning-refresh/practice.webp', 'Cranes and containers at a busy port'],
  ['images/learning-refresh/learn.webp', 'A laptop ready for work and learning'],
  ['images/learning-refresh/credentials.webp', 'Business data and charts on computer monitors'],
  ['images/learning-refresh/launch.webp', 'A calendar and work tools on a computer screen'],
].map(([p, alt]) => ({ src: asset(p), alt }));
// Presentation choices only: the titles and full section bodies remain CMS-owned.
const SECTION_VISUALS = {
  'who we are': [0, 'images/page-refresh/about-warehouse-discussion.webp', 'A team discussing warehouse operations'],
  'our areas of expertise': [1, 'images/edtech/neural-cutout-960.webp', 'Navy and gold brain illustration with circuit traces'],
  'consulting & industry solutions': [2, 'images/editorial/warehouse.webp', 'Workers reviewing inventory in a warehouse'],
  'workforce development': [3, 'images/editorial/classroom.webp', 'Students learning together in a classroom'],
  'how we work': [4, 'images/page-refresh/about-practical-work.webp', 'Workers discussing practical warehouse tasks'],
  'operating across borders': [5, 'images/editorial/trade.webp', 'A cargo ship carrying goods across borders'],
  'our vision': [6, 'images/learning-refresh/experience.webp', 'A ship beside a waterfront building'],
  'our mission': [7, 'images/learning-refresh/student-projects.webp', 'Students working on a project together'],
  'why 4pl consultancy': [8, 'images/learning-refresh/credentials.webp', 'Business data and charts on computer monitors'],
  'leadership perspective': [9, 'images/editorial/business.webp', 'People exchanging ideas in a business meeting'],
  'enabling growth through expertise': [10, 'images/edtech/chip-cutout-960.webp', 'Navy and gold AI chip illustration'],
  'university alliance program': [11, 'images/learning-refresh/student-perspectives.webp', 'Students studying together in a library'],
};
const clean = (t) => String(t || '').replace(/Admission\s*[–—-]\s*Training\s*[–—-]\s*Placement model/gi, 'approach');

function go(id, reduce, focus) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('header')?.getBoundingClientRect().height || 80;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - 16, behavior: reduce ? 'auto' : 'smooth' });
  if (focus) el.querySelector('h2')?.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}

function Offices() {
  const st = useContactSettings();
  return (
    <section id="about-offices" className="scroll-mt-28 border-t border-line py-12 sm:py-16">
      <h2 tabIndex={-1} className="display-lg break-words text-navy focus:outline-none">Our offices</h2>
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


const H2 = 'display-lg break-words text-navy focus:outline-none';
const LIST = '[&_ul]:list-none [&_ul]:pl-0 [&_li]:relative [&_li]:border-l-2 [&_li]:border-gold [&_li]:pl-4';
const NUM = '[&_ul]:list-none [&_ul]:pl-0 [&_ul]:[counter-reset:n] [&_li]:[counter-increment:n] [&_li]:flex [&_li]:gap-3 [&_li]:border-b [&_li]:border-line [&_li]:pb-2 [&_li]:before:content-[counter(n,decimal-leading-zero)] [&_li]:before:font-display [&_li]:before:font-extrabold [&_li]:before:text-gold-deep';
const TICK = '[&_ul]:list-none [&_ul]:pl-0 [&_ul]:grid [&_ul]:gap-2 sm:[&_ul]:grid-cols-2 [&_li]:rounded-xl [&_li]:bg-white/10 [&_li]:p-3';
const fig = (ph, cls) => ph && (
  <figure className={cn('group min-w-0 overflow-hidden bg-mist', cls, /cutout/.test(ph.src) && '!aspect-square !overflow-visible !rounded-none !bg-transparent')}>
    <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" className={cn('h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100', /cutout/.test(ph.src) && '!object-contain')} />
  </figure>
);

function Block({ s, i, ph, variant }) {
  const body = has(s.body) ? s.body : '';
  const why = /why\s*4pl/i.test(s.title);
  const k = variant ?? i % 8;
  const title = (c) => (<><h2 tabIndex={-1} className={cn(H2, c)}>{s.title}</h2><div className="gold-rule mt-4" /></>);
  const sec = (cls, inner) => <section id={s.id} data-testid={`about-section-${i}`} className={cn('scroll-mt-28', cls)}><Reveal>{inner}</Reveal></section>;
  if (!body) return sec('border-t border-line pt-12', <div className="flex items-center gap-4"><span className="num-xl text-4xl text-gold-deep">{String(i + 1).padStart(2, '0')}</span><div><h2 tabIndex={-1} className={H2}>{s.title}</h2></div></div>);
  if (why) return sec('py-12', (
    <div className="navy-surface on-navy overflow-hidden rounded-3xl">
      <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,12rem)_1fr] md:items-start">
        <div className="space-y-4"><img src={LOGO} alt="4PL Academy logo" width="684" height="519" loading="lazy" className="h-auto w-40 rounded-2xl bg-surface p-3 md:w-full" />{fig(ph, 'hidden rounded-2xl aspect-[4/3] md:block')}</div>
        <div className="min-w-0"><h2 tabIndex={-1} className={cn(H2, '!text-surface')}>{s.title}</h2><div className="gold-rule mt-4" /><div className={cn('mt-5 text-surface/85 [&_.prose-4pl]:!text-surface/85 [&_p]:!text-surface/85 [&_li]:!text-surface/85 [&_h3]:!text-gold', TICK)}><RichText text={body} /></div></div>
      </div>
    </div>));
  const rt = (c) => <div className={cn('mt-5', c)}><RichText text={body} /></div>;
  switch (k) {
    case 0: return sec('border-t border-line py-12', <div className="grid gap-8 md:grid-cols-2 md:items-center"><div className="min-w-0">{title()}{rt(LIST)}</div>{fig(ph, 'aspect-[4/3] rounded-3xl')}</div>);
    case 1: return sec('py-12', <div className="grid overflow-hidden rounded-3xl bg-navy text-surface md:grid-cols-[2fr_3fr]">{fig(ph, 'min-h-56')}<div className="min-w-0 p-6 sm:p-10">{title('!text-surface')}{rt(cn('[&_.prose-4pl]:!text-surface/85 [&_p]:!text-surface/85 [&_li]:!text-surface/85 [&_h3]:!text-gold', TICK))}</div></div>);
    case 2: return sec('border-t border-line py-12', <div>{fig(ph, 'aspect-[21/9] rounded-3xl')}<div className="mt-8">{title()}</div><div className="mt-5 md:columns-2 md:gap-10">{<RichText text={body} />}</div></div>);
    case 3: return sec('border-t border-line py-12', <div className="grid gap-8 md:grid-cols-[1fr_16rem] md:items-start"><div className="min-w-0"><span className="num-xl text-6xl text-gold/60">{String(i + 1).padStart(2, '0')}</span><div className="mt-2">{title()}</div>{rt(NUM)}</div>{fig(ph, 'aspect-[3/4] rounded-[2.5rem]')}</div>);
    case 4: return sec('py-12', <div className="grid gap-8 rounded-3xl bg-gold-soft p-6 sm:p-10 md:grid-cols-[18rem_1fr]">{fig(ph, 'aspect-[4/5] rounded-2xl')}<div className="min-w-0">{title()}{rt(LIST)}</div></div>);
    case 5: return sec('border-t border-line py-12', <div className="grid gap-8 md:grid-cols-2"><div className="min-w-0">{title()}{rt(NUM)}</div><div>{fig(ph, 'aspect-square rounded-3xl')}</div></div>);
    case 6: return sec('py-12', <div className="rounded-3xl bg-mist p-6 sm:p-10"><div className="mx-auto max-w-3xl">{title()}{rt(LIST)}</div>{fig(ph, 'mx-auto mt-8 aspect-[16/9] max-w-3xl rounded-2xl')}</div>);
    case 9: return sec('border-t border-line py-12', <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">{fig(ph, 'aspect-[3/4] rounded-t-full rounded-b-3xl')}<div className="min-w-0"><span aria-hidden="true" className="font-display text-7xl leading-none text-gold">“</span>{title()}<div className="mt-6 border-l-4 border-gold pl-5 text-lg italic"><RichText text={body} /></div></div></div>);
    case 10: return sec('border-t border-line py-12', <div className="relative">{fig(ph, 'aspect-[16/7] rounded-t-3xl')}<div className="relative ml-4 border-l-4 border-gold bg-background px-5 py-8 sm:ml-10 sm:px-8">{title()}{rt('max-w-2xl')}</div></div>);
    case 11: return sec('border-t border-line py-12', <div className="grid gap-8 md:grid-cols-2 md:items-center"><div className="min-w-0 rounded-3xl border border-gold/40 p-6 sm:p-8">{title()}{rt('text-lg')}</div><div className="border-b-8 border-gold pb-3">{fig(ph, 'aspect-[4/5] rounded-t-3xl rounded-b-lg')}</div></div>);
    default: return sec('border-t border-line py-12', <div className="relative isolate overflow-hidden rounded-3xl bg-navy text-surface">{ph && <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />}<div className="p-6 sm:p-12 md:max-w-3xl">{title('!text-surface')}{rt('[&_.prose-4pl]:!text-surface/90 [&_p]:!text-surface/90 [&_li]:!text-surface/90 [&_h3]:!text-gold ' + LIST)}</div></div>);
  }
}

export default function AboutPage() {
  const q = usePublicItem('pages', 'about');
  const reduce = useReducedMotion();
  const p = q.data;
  const heroImg = (p && has(p.image) && mediaUrl(p.image)) || HERO;
  useSeo(seoFrom(p, { title: 'About 4PL Academy', description: 'The education and training arm of 4PL Consultancy Ltd.' }));
  const { intro, sections } = useMemo(() => splitMarkdown(clean(p?.description)), [p?.description]);
  const gallery = useMemo(() => (Array.isArray(p?.items) ? p.items : []).filter((g) => has(g?.image)).map((g) => ({ src: mediaUrl(g.image), alt: g.altText || '', sectionTitle: String(g.name || '').trim().toLowerCase() })), [p?.items]);
  const photos = useMemo(() => { const seen = new Set([heroImg, HERO]); return [...gallery, ...FALLBACK_PHOTOS].filter((x) => !seen.has(x.src) && seen.add(x.src)); }, [gallery, heroImg]);
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
    const f = requestAnimationFrame(() => go(id, true, false));
    return () => cancelAnimationFrame(f);
  }, [sections.length]);

  const usedPhotos = new Set([heroImg, HERO]);
  return (
    <div>
      <SplitHero image={heroImg} logo={<img src={LOGO} alt="4PL Academy: Creating Global Professionals" width="684" height="519" className="mb-6 h-20 w-auto rounded-xl border border-line bg-white p-2 shadow-sm" />} eyebrow="About 4PL Academy" title={q.isLoading ? <Skeleton className="h-24 max-w-2xl" /> : (p?.name || 'About 4PL Academy')} body={p?.shortDescription || 'The education and training arm of 4PL Consultancy Ltd, connecting university learning, practical industry expertise and professional growth across India and the UK.'} actions={<><Link href="/programs" className="btn btn-gold btn-hero">Explore programs</Link><Link href="/contact" className="btn btn-hero btn-outline">Contact us</Link></>} />

      <div className="container-x py-8">
        {q.isLoading ? <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-64" /></div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !p || !sections.length && !has(intro) ? (
          <EmptyState title="Content coming soon" body="This page is being prepared." action={<Link href="/contact" className="btn btn-navy">Contact us</Link>} />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
            <nav aria-label="About page sections" data-testid="about-nav" className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
              <ul className="flex flex-wrap gap-2 py-2 lg:flex-col lg:flex-nowrap lg:gap-0 lg:py-0">
                {nav.map((s) => (
                  <li key={s.id} className="max-w-full">
                    <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); setActive(s.id); go(s.id, reduce, true); }} aria-current={active === s.id ? 'true' : undefined}
                      className={cn('block whitespace-normal break-words rounded-full border px-3 py-2 text-xs font-bold uppercase leading-snug tracking-wider transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:py-2.5 lg:hover:pl-4', active === s.id ? 'border-gold bg-navy text-surface lg:bg-transparent lg:pl-4 lg:text-gold-deep' : 'border-line text-navy/70 hover:text-navy lg:border-l-line')}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="min-w-0">
              {has(intro) && <Reveal className="max-w-3xl pb-10 text-lg"><RichText text={intro} /></Reveal>}
              {sections.map((s, i) => {
                const sectionTitle = s.title.trim().toLowerCase();
                const visual = SECTION_VISUALS[sectionTitle];
                const preferred = gallery.find((g) => g.sectionTitle === sectionTitle) || (visual && { src: asset(visual[1]), alt: visual[2] });
                const ph = has(s.body) ? (preferred && !usedPhotos.has(preferred.src) ? preferred : photos.find((x) => !usedPhotos.has(x.src))) : null;
                if (ph) usedPhotos.add(ph.src);
                return <Block key={s.id} s={s} i={i} ph={ph} variant={visual?.[0]} />;
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

              <Reveal className="navy-surface on-navy mt-10 rounded-3xl p-8 sm:p-12">
                <h2 className="display-lg text-surface">Talk to the 4PL Academy team</h2>
                <p className="mt-4 max-w-2xl text-surface/80">Explore programs, universities and partnership opportunities, or send us a message.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/contact" className="btn btn-gold btn-hero">Contact us <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                  <Link href="/programs" className="btn btn-hero btn-light">Programs</Link>
                  <Link href="/universities" className="btn btn-hero btn-light">Universities</Link>
                  <Link href="/partner-with-us" className="btn btn-hero btn-light">Partner with us</Link>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
