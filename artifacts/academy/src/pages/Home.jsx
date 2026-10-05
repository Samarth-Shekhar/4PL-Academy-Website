import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bot, Building2, GraduationCap, Handshake, Briefcase, Search, Landmark, Factory, Hammer, Rocket, Globe2, Users } from 'lucide-react';
import { useGetDiscovery, getGetDiscoveryQueryKey } from '@workspace/api-client-react';
import { usePublicItem, usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { asset, has, lines, val } from '@/lib/format';
import { openBot } from '@/lib/events';
import { Reveal, SectionHead, CardSkeletons, EmptyState, ErrorState } from '@/components/ui-kit';
import { ProgramCard, BlogCard } from '@/components/Cards';
import { RichText } from '@/components/RichText';
import { Link as L2 } from 'wouter';

const split = (s) => { const m = String(s).split(/\s*[|:]\s+|:\s*|\s\|\s/); return m.length > 1 ? [m[0], m.slice(1).join(': ')] : [s, '']; };
const WHY = ['Industry expertise', 'Practical learning', 'Live projects', 'Industry mentors', 'Internships', 'Career preparation', 'Global exposure'];
const STEPS = ['Admission', 'Training', 'Projects', 'Industry exposure', 'Internship', 'Career'];
const WHY_ICONS = [Factory, Hammer, Rocket, Users, Briefcase, GraduationCap, Globe2];

function Hero({ page }) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');
  const [, nav] = useLocation();
  return (
    <section className="navy-surface on-navy overflow-hidden">
      <div className="container-x grid gap-10 pb-12 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-20 lg:pt-20">
        <div>
          <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-4">4PL Academy &middot; Learning arm of 4PL Consultancy Ltd</motion.p>
          <motion.h1 initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.7 }} className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
            {page?.name ? page.name.split(/\s+/).map((word,i)=><span key={i} className={word.toLowerCase()==='global'?'text-gold':''}>{i>0?' ':''}{word}</span>) : '4PL Academy'}
          </motion.h1>
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-5 max-w-xl text-lg leading-relaxed text-surface/80 sm:text-xl">{page?.shortDescription || 'Loading approved page content…'}</motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/programs" className="btn btn-gold" data-testid="link-hero-programs">Explore Programs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <button type="button" onClick={() => openBot()} className="btn btn-light" data-testid="button-hero-bot"><Bot className="h-4 w-4" aria-hidden="true" /> Talk to ACAD BOT</button>
            <Link href="/for-universities" className="btn text-surface underline-offset-4 hover:underline">Partner With 4PL</Link>
          </motion.div>
          <form action="#" onSubmit={(e) => { e.preventDefault(); nav(`/programs${q ? `?search=${encodeURIComponent(q)}` : ''}`); }} className="mt-8 flex max-w-xl gap-2 rounded-lg bg-surface/10 p-2 ring-1 ring-surface/20" role="search">
            <label htmlFor="hero-search" className="sr-only">Search programs and universities</label>
            <input id="hero-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MBA, BBA, logistics" className="input border-transparent bg-surface" />
            <button type="submit" className="btn btn-gold px-4" aria-label="Search programs"><Search className="h-5 w-5" /></button>
          </form>
          <p className="mt-4 max-w-xl text-xs text-surface/60">Admission, training and placement support. Outcomes are never guaranteed.</p>
        </div>
        <motion.figure initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="relative">
          <div className="absolute -bottom-3 -right-3 h-full w-full rounded-lg border-2 border-gold/70" aria-hidden="true" />
          <img src={asset('images/hero-students.webp')} alt="Group of university students collaborating around laptops in a modern classroom" width="1280" height="960" className="relative aspect-[4/3] w-full rounded-lg object-cover sm:aspect-[5/4]" fetchPriority="high" />
          <figcaption className="relative mt-4 text-[0.7rem] uppercase tracking-wider text-surface/55">Representative generic imagery. Not a specific campus.</figcaption>
        </motion.figure>
      </div>
      <div className="border-t border-surface/15 bg-navy-2/60">
        <div className="container-x grid grid-cols-2 gap-px py-5 text-center text-xs font-bold uppercase tracking-[0.16em] sm:grid-cols-4 sm:text-sm">
          {['Universities', 'Industry', 'Practical learning', 'Career development'].map((t, i) => (
            <div key={t} className="flex items-center justify-center gap-2 py-2"><span className="text-gold">{i ? '+' : ''}</span><span>{t}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Journeys() {
  const d = useGetDiscovery({ query: { queryKey: getGetDiscoveryQueryKey(), staleTime: 30000, refetchOnMount: true } }).data;
  const items = [
    { icon: GraduationCap, t: 'Degree Programs', b: 'Undergraduate and postgraduate degrees with an industry layer.', n: d && `${d.programs} listed`, h: '/programs' },
    { icon: Briefcase, t: 'Professional Courses', b: 'Short-term and long-term courses in logistics and trade.', n: d && `${d.courses} listed`, h: '/courses' },
    { icon: Landmark, t: 'Find a University', b: 'Search the directory by city, state and degree.', n: d && `${d.universities} records`, h: '/universities' },
    { icon: Handshake, t: 'Partner With 4PL', b: 'Universities: connect with industry and a student pipeline.', n: 'Institutions', h: '/for-universities' },
  ];
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHead eyebrow="Choose your journey" title="What are you looking for?" body="Whether you are a student, a parent, a working professional or a university, begin where it makes sense." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 0.07}>
            <Link href={it.h} className="group relative flex h-full min-h-[14rem] flex-col overflow-hidden rounded-lg border border-line bg-card p-6 transition hover:-translate-y-1 hover:border-gold hover:shadow-[0_22px_40px_-24px_hsl(221_76%_17%/.5)]">
              <it.icon className="h-8 w-8 text-gold-deep" aria-hidden="true" />
              <h3 className="mt-5 text-2xl leading-tight text-navy">{it.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.b}</p>
              <div className="mt-auto flex items-center justify-between pt-5"><span className="chip chip-gold">{it.n || '\u00a0'}</span><ArrowRight className="h-5 w-5 text-navy transition-transform group-hover:translate-x-1" aria-hidden="true" /></div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const q = usePublicList('programs');
  const list = (q.data || []).slice().sort((a, b) => Number(b.featured) - Number(a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).slice(0, 6);
  return (
    <section className="bg-mist/70 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Featured programs" title="Degrees designed with industry in the room">
          <Link href="/programs" className="btn btn-outline self-start">All programs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </SectionHead>
        {q.isLoading ? <CardSkeletons n={3} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState title="Programs are being published" body="Check back shortly, or ask our admissions team." action={<Link href="/counselling" className="btn btn-navy">Request counselling</Link>} /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.06}><ProgramCard p={p} /></Reveal>)}</div>
        )}
      </div>
    </section>
  );
}

function About({ page }) {
  const hl = lines(page?.highlights);
  return (
    <section className="container-x py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-3">The 4PL Academy approach</p>
          <h2 className="text-3xl leading-tight text-navy sm:text-5xl">{has(page?.name) && page.name.toLowerCase() !== 'home' ? page.name : 'Bridging universities and industry'}</h2>
          <div className="gold-rule mt-5" />
          {has(page?.shortDescription) && <p className="mt-6 text-lg leading-relaxed text-foreground/80">{page.shortDescription}</p>}
        </Reveal>
        <Reveal delay={0.1}>
          {page ? <RichText text={page.description} /> : <p className="text-muted-foreground">{val('')}</p>}
          {hl.length > 0 && <ul className="mt-4 grid gap-2 sm:grid-cols-2">{hl.map((h, i) => <li key={i} className="border-l-2 border-gold bg-card py-2 pl-3 pr-2 text-sm font-semibold text-navy">{h}</li>)}</ul>}
          <Link href="/about" className="btn btn-navy mt-6">About 4PL Academy <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function Why({ page }) {
  const hl = lines(page?.highlights);
  const items = hl.length ? hl.map(split) : WHY.map((w) => [w, '']);
  return (
    <section className="navy-surface on-navy py-16 sm:py-24">
      <div className="container-x">
        <SectionHead light eyebrow="Why 4PL" title="Learning that is wired into the industry" />
        <div className="grid gap-px overflow-hidden rounded-lg bg-surface/15 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map(([t, b], i) => {
            const I = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <Reveal key={t + i} delay={(i % 4) * 0.05} className="bg-navy p-6 transition-colors hover:bg-navy-2">
                <I className="h-7 w-7 text-gold" aria-hidden="true" />
                <h3 className="mt-4 text-xl">{t}</h3>
                {b && <p className="mt-2 text-sm leading-relaxed text-surface/70">{b}</p>}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Timeline({ title, eyebrow, steps, note }) {
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHead eyebrow={eyebrow} title={title} body={note} />
      <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
        <span className="absolute left-5 top-3 hidden h-[calc(100%-1.5rem)] w-px bg-gold/60 sm:hidden" aria-hidden="true" />
        <span className="absolute left-0 right-0 top-5 hidden h-px bg-gold/50 lg:block" aria-hidden="true" />
        {steps.map((s, i) => (
          <Reveal as="li" key={s + i} delay={i * 0.08} className="relative flex gap-4 lg:block">
            <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy font-display text-lg text-gold ring-4 ring-surface">{i + 1}</span>
            <div className="lg:mt-4"><h3 className="text-xl text-navy">{s}</h3></div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function Partners() {
  const q = usePublicList('universities');
  const verified = (q.data || []).filter((u) => u.partnershipVerified);
  return (
    <section className="bg-mist/70 py-16 sm:py-20">
      <div className="container-x">
        <SectionHead eyebrow="University alliance" title="Verified university partners" body="Only institutions whose partnership with 4PL Academy has been verified appear with their logo here.">
          <Link href="/universities" className="btn btn-outline self-start">Browse directory</Link>
        </SectionHead>
        {q.isLoading ? <CardSkeletons n={4} className="h-24" /> : !verified.length ? (
          <EmptyState icon={Building2} title="Partnerships are being verified" body="Our directory lists institutions for discovery. Confirmed partners will be shown here with their logos once verified by 4PL Academy." action={<Link href="/universities" className="btn btn-navy">Explore the directory</Link>} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {verified.map((u) => <Link key={u.id} href={`/universities/${u.slug}`} className="card-s grid h-28 place-items-center p-4 hover:border-gold">{has(u.logo) ? <img src={u.logo} alt={u.name} className="max-h-full max-w-full object-contain" loading="lazy" /> : <span className="text-center font-display text-navy">{u.name}</span>}</Link>)}
          </div>
        )}
      </div>
    </section>
  );
}

function Career({ page }) {
  const pathway = lines(page?.careerPaths).length ? lines(page.careerPaths) : lines(page?.highlights);
  return (
    <section className="container-x py-16 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-2 lg:order-1">
          <img src={asset('images/industry-logistics.webp')} alt="Container port with cranes and cargo ships at dusk" width="1280" height="960" loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
          <p className="mt-3 text-[0.7rem] uppercase tracking-wider text-muted-foreground">Representative generic imagery</p>
        </Reveal>
        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <p className="eyebrow mb-3">Career &amp; industry</p>
          <h2 className="text-3xl leading-tight text-navy sm:text-4xl">From classroom to the global supply chain</h2>
          {has(page?.shortDescription) ? <p className="mt-4 text-lg text-foreground/80">{page.shortDescription}</p> : page && <div className="mt-4"><RichText text={(page.description || '').split(/\n{2,}/)[0]} /></div>}
          {pathway.length > 0 && <ul className="mt-4 space-y-2">{pathway.slice(0, 6).map((p, i) => <li key={i} className="flex gap-3 text-sm"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{p}</li>)}</ul>}
          <Link href="/career-industry" className="btn btn-navy mt-6">Explore career &amp; industry <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function StudentLife() {
  return (
    <section className="relative overflow-hidden">
      <img src={asset('images/student-life.webp')} alt="Students walking and talking outdoors" width="1280" height="960" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30" aria-hidden="true" />
      <div className="container-x on-navy relative py-20 text-surface sm:py-28">
        <p className="eyebrow mb-3">Student life</p>
        <h2 className="max-w-xl text-3xl leading-tight sm:text-5xl">More than a timetable</h2>
        <p className="mt-4 max-w-lg text-surface/80">See what life as a learner looks like beyond lectures.</p>
        <Link href="/student-life" className="btn btn-gold mt-6">Explore student life</Link>
        <p className="mt-10 text-[0.7rem] uppercase tracking-wider text-surface/60">Representative generic imagery. Not a specific campus.</p>
      </div>
    </section>
  );
}

function Blogs() {
  const q = usePublicList('blogs');
  const list = (q.data || []).slice(0, 3);
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHead eyebrow="Insights" title="From the 4PL Academy desk"><Link href="/blogs" className="btn btn-outline self-start">All articles</Link></SectionHead>
      {q.isLoading ? <CardSkeletons n={3} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState title="Articles are coming soon" body="We publish only reviewed articles. Meanwhile, ACAD BOT can answer questions from verified information." action={<button type="button" onClick={() => openBot()} className="btn btn-navy">Ask ACAD BOT</button>} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BlogCard key={b.id} b={b} />)}</div>}
    </section>
  );
}

export default function Home() {
  const home = usePublicItem('pages', 'home').data;
  const career = usePublicItem('pages', 'career-industry').data;
  useSeo({
    title: home?.seoTitle || '4PL Academy | Creating Global Professionals',
    description: home?.seoDescription || 'Industry-integrated education built for real-world careers. Explore degree programs, professional courses and a university directory.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: '4PL Academy', slogan: 'Creating Global Professionals', parentOrganization: { '@type': 'Organization', name: '4PL Consultancy Ltd' }, logo: new URL(asset('images/4pl-logo.jpg'), window.location.origin).href, url: window.location.origin },
  });
  const steps = lines(home?.curriculum).length ? lines(home.curriculum) : STEPS;
  return (
    <>
      <Hero page={home} />
      <Journeys />
      <Featured />
      <About page={home} />
      <Why page={home} />
      <Timeline eyebrow="How it works" title="Your path, step by step" steps={steps} note="Admission, training and placement support at every stage. Support is provided; outcomes are never guaranteed." />
      <Partners />
      <Career page={career} />
      <StudentLife />
      <Blogs />
      <section className="px-4 pb-16"><div className="navy-surface on-navy container-x rounded-xl px-6 py-12 text-center sm:py-16">
        <Bot className="mx-auto h-9 w-9 text-gold" aria-hidden="true" />
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl sm:text-4xl">Have questions about programs, universities or admissions?</h2>
        <button type="button" onClick={() => openBot()} className="btn btn-gold mt-6" data-testid="button-cta-bot">Ask ACAD BOT</button>
      </div></section>
      <section className="container-x pb-8 text-center">
        <h2 className="font-display text-4xl text-navy sm:text-6xl">Creating Global Professionals</h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/programs" className="btn btn-navy">Explore Programs</Link><L2 href="/counselling" className="btn btn-outline">Request Counselling</L2></div>
      </section>
    </>
  );
}
