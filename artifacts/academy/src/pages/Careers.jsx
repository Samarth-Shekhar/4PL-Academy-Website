import { useEffect, useState } from 'react';
import { usePublicItem } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { asset, has } from '@/lib/format';
import { mediaUrl } from '@/lib/home';
import { Reveal, Skeleton, ErrorState, SplitHero } from '@/components/ui-kit';
import { Cta } from '@/components/home/shared';
import { cn } from '@/lib/cn';

const IMG = {
  a: asset('images/program-hero/bba-digital-marketing-objects-1920.webp'),
  b: asset('images/program-hero/bba-ai-objects-1920.webp'),
  c: asset('images/program-hero/mba-supply-chain-objects-1920.webp'),
};
const FB = {
  name: 'Build Your Career. Create Global Professionals.',
  shortDescription: 'Explore the purpose, learning focus and industry perspective behind 4PL Academy.',
  description: '4PL Academy is the learning arm of 4PL Consultancy Ltd. We connect university education with industry, through degree pathways and professional courses in logistics and supply chain, AI and digital marketing.',
  ctaLabel: 'Get in touch', ctaUrl: '/contact?intent=careers',
  secondaryCtaLabel: 'Discover 4PL Academy', secondaryCtaUrl: '/about',
};
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'why', label: 'Why 4PL Academy' },
  { id: 'work', label: 'Our work' },
  { id: 'life', label: 'Culture' },
  { id: 'approach', label: 'Our approach' },
  { id: 'areas', label: 'Work areas' },
  { id: 'impact', label: 'Impact' },
  { id: 'job-openings', label: 'Job Openings' },
  { id: 'faq', label: 'FAQ' },
];
const WHY = [
  ['Learning with a purpose', 'Education is most useful when it leads somewhere. We start from the question of what a graduate needs to be ready for.'],
  ['Backed by industry', 'As part of 4PL Consultancy Ltd, our learning thinking is shaped by the way logistics and business actually run.'],
  ['A global outlook', 'Our name is our aim: Creating Global Professionals, wherever learners choose to build their careers.'],
];
const AREAS = [
  ['Logistics and supply chain', 'Degree pathways and professional courses on how goods, data and decisions move.', IMG.c],
  ['Artificial intelligence', 'Learning that helps people understand and apply AI in modern organisations.', IMG.b],
  ['Digital marketing', 'Practical programmes on how brands reach and understand audiences online.', IMG.a],
];
const APPROACH = [
  ['Connect', 'Bridge university education and industry expectations.'],
  ['Clarify', 'Explain pathways and courses in plain language.'],
  ['Support', 'Guide learners through choices, training and next steps.'],
];
const FAQS = [
  ['What is 4PL Academy?', 'It is the learning arm of 4PL Consultancy Ltd, connecting university education with industry through degree pathways and professional courses.'],
  ['What does this page cover?', 'Learn about our purpose, working approach and the areas of education and industry we focus on.'],
  ['How can I get in touch?', 'Use the contact page and tell us what you would like to discuss. Our team will read your message.'],
  ['Where can I learn about programmes?', 'Browse degree pathways and professional courses from the Courses menu, or read more on the About page.'],
];

function go(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: reduce ? 'instant' : 'smooth' });
  history.replaceState(null, '', `#${id}`);
}

export default function Careers() {
  const q = usePublicItem('pages', 'careers');
  const p = { ...FB, ...Object.fromEntries(Object.entries(q.data || {}).filter(([, v]) => has(v))) };
  useSeo(seoFrom(q.data, { title: 'Careers', description: FB.shortDescription }));
  const [active, setActive] = useState('overview');
  useEffect(() => {
    if (q.isLoading) return;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!SECTIONS.some((s) => s.id === id)) return;
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: 'instant' });
    };
    const frame = requestAnimationFrame(scrollToHash);
    window.addEventListener('hashchange', scrollToHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', scrollToHash); };
  }, [q.isLoading]);
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver((es) => {
      es.filter((e) => e.isIntersecting).forEach((e) => setActive(e.target.id));
    }, { rootMargin: '-30% 0px -60% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  const hero = (q.data && mediaUrl(q.data.image)) || IMG.a;
  const paras = String(p.description).split(/\n{2,}/);
  const openings = (Array.isArray(q.data?.items) ? q.data.items : []).filter((job) => has(job.name));
  const sec = 'scroll-mt-36 border-t border-line py-12 sm:py-16';
  return (
    <div>
      <SplitHero image={hero} eyebrow="Careers" title={q.isLoading ? <Skeleton className="h-24 max-w-2xl" /> : p.name} body={p.shortDescription} actions={<><Cta label={p.ctaLabel} url={p.ctaUrl} className="btn-hero" /><Cta label={p.secondaryCtaLabel} url={p.secondaryCtaUrl} variant="outline" className="btn-hero" /></>} />

      <div className="container-x grid grid-cols-1 gap-8 py-8 lg:grid-cols-[13rem_1fr] lg:gap-14">
        <nav aria-label="Careers page sections" className="sticky top-[4.5rem] z-30 min-w-0 max-w-full bg-background/95 backdrop-blur lg:top-32 lg:self-start">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto py-2 lg:flex-col lg:gap-0 lg:py-0">
            {SECTIONS.map((s) => (
              <li key={s.id} className="shrink-0">
                <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); go(s.id); }} aria-current={active === s.id ? 'true' : undefined}
                  className={cn('block whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-wider lg:rounded-none lg:border-0 lg:border-l-2 lg:py-3', active === s.id ? 'border-gold bg-navy text-surface lg:bg-transparent lg:text-gold-deep' : 'border-line text-navy/70 hover:text-navy')}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <section id="overview" className="scroll-mt-36 pb-12 sm:pb-16">
            <Reveal className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="display-lg text-navy">Guiding learners toward careers that fit.</h2>
                <div className="gold-rule mt-5" />
                <div className="mt-5 space-y-3 leading-relaxed text-muted-foreground">{paras.map((t, i) => <p key={i}>{t}</p>)}</div>
              </div>
              <img src={IMG.c} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
            </Reveal>
          </section>

          <section id="why" className={sec}>
            <Reveal>
              <h2 className="display-lg text-navy">Why 4PL Academy</h2>
              <dl className="mt-8 divide-y divide-line">
                {WHY.map(([t, d]) => <div key={t} className="grid gap-2 py-5 md:grid-cols-[1fr_2fr]"><dt className="font-display text-xl font-bold text-navy">{t}</dt><dd className="text-muted-foreground">{d}</dd></div>)}
              </dl>
            </Reveal>
          </section>

          <section id="work" className={sec}>
            <Reveal className="grid gap-8 md:grid-cols-2 md:items-center">
              <img src={IMG.b} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
              <div>
                <h2 className="display-lg text-navy">The work we do</h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">We help connect universities and industry, present degree pathways and professional courses clearly, and support learners as they decide what to study next.</p>
              </div>
            </Reveal>
          </section>

          <section id="life" className={sec}>
            <Reveal className="rounded-3xl bg-navy p-8 text-surface sm:p-12">
              <p className="eyebrow">Culture</p>
              <h2 className="display-lg mt-3 text-surface">Curious, clear and useful.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-surface/80">We value plain speaking, learning from industry, and work that helps a student see their next step more clearly.</p>
            </Reveal>
          </section>

          <section id="approach" className={sec}>
            <Reveal>
              <h2 className="display-lg text-navy">Our approach</h2>
              <ol className="mt-8 grid gap-4 sm:grid-cols-3">
                {APPROACH.map(([t, d], i) => <li key={t} className="card-s p-6"><span className="num-xl text-3xl text-gold-deep">0{i + 1}</span><h3 className="mt-3 text-xl text-navy">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}
              </ol>
            </Reveal>
          </section>

          <section id="areas" className={sec}>
            <Reveal>
              <h2 className="display-lg text-navy">Areas we work in</h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {AREAS.map(([t, d, im]) => <li key={t} className="card-s overflow-hidden"><img src={im} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" /><div className="p-5"><h3 className="text-lg text-navy">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div></li>)}
              </ul>
            </Reveal>
          </section>

          <section id="impact" className={sec}>
            <Reveal className="max-w-3xl">
              <h2 className="display-lg text-navy">The impact we aim for</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Our ambition is simple: help learners become capable, confident professionals who can contribute anywhere in the world. Outcomes depend on each learner, and we never promise them.</p>
            </Reveal>
          </section>

          <section id="job-openings" className={sec} aria-labelledby="job-openings-title">
            <h2 id="job-openings-title" className="display-lg text-navy">Job Openings</h2>
            {q.isLoading ? <Skeleton className="mt-8 h-32" /> : q.isError ? <div className="mt-8"><ErrorState onRetry={q.refetch} /></div> : openings.length ? (
              <ul className="mt-8 space-y-4">
                {openings.map((job, i) => (
                  <li key={`${job.name}-${i}`} className="card-s p-6 sm:p-8">
                    <h3 className="break-words text-2xl font-bold text-navy">{job.name}</h3>
                    {has(job.description) && <p className="mt-3 whitespace-pre-line break-words leading-relaxed text-muted-foreground">{job.description}</p>}
                    {has(job.url) && job.url !== 'bot' && <div className="mt-5"><Cta label="View opportunity" url={job.url} variant="navy" /></div>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-line bg-mist/60 px-6 py-10 sm:px-8" data-testid="careers-no-openings">
                <p className="text-xl font-semibold text-navy">No open positions right now.</p>
              </div>
            )}
          </section>

          <section id="faq" className={sec}>
            <h2 className="display-lg text-navy">Questions</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {FAQS.map(([qn, a]) => (
                <details key={qn} className="group py-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-navy [&::-webkit-details-marker]:hidden">{qn}<span aria-hidden="true" className="text-2xl text-gold-deep transition-transform group-open:rotate-45">+</span></summary>
                  <p className="mt-2 max-w-2xl text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
            <div className="mt-10"><Cta label={p.ctaLabel} url={p.ctaUrl} variant="navy" /></div>
          </section>
        </div>
      </div>
    </div>
  );
}
