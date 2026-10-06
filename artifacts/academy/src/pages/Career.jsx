import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Briefcase, GraduationCap, BookOpen, Award, Search, Layers, ArrowRight, Info } from 'lucide-react';
import { usePublicItem, usePublicList } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { has, lines, uniq, asset } from '@/lib/format';
import { PageHero, Skeleton, ErrorState, EmptyState, Reveal } from '@/components/ui-kit';
import { RichText } from '@/components/RichText';
import { BookButton } from '@/components/BookCta';

const GROUPS = [
  ['careerPaths', 'Career pathways', Briefcase],
  ['outcomes', 'Learning outcomes', Award],
  ['curriculum', 'Curriculum', BookOpen],
  ['semesterModules', 'Semester modules', BookOpen],
  ['projects', 'Projects', Layers],
  ['internships', 'Internships', Briefcase],
  ['industryExposure', 'Industry exposure', Layers],
  ['highlights', 'Highlights', Award],
];
const ok = (x) => x && x.verified === true && x.status === 'published' && x.enabled !== false;
const areaOf = x => x.specialization || x.category || '';

function Result({ item, kind }) {
  const detail = { ...item, semesterModules: (item.semesters || []).flatMap(s => (s.modules || []).map(m => `${s.name}: ${m}`)) };
  const groups = GROUPS.map(([k, label, Icon]) => [k, label, Icon, lines(detail[k])]).filter((g) => g[3].length);
  const ctx = kind === 'program' ? { program: item.name, interestedIn: 'Career pathway' } : { course: item.name, interestedIn: 'Career pathway' };
  return (
    <div className="card-s p-5 sm:p-8" aria-live="polite" data-testid="panel-career-result">
      <p className="eyebrow">{kind === 'program' ? 'Program' : 'Course'}</p>
      <h3 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">{item.name}</h3>
      {has(item.shortDescription) && <p className="mt-2 max-w-2xl text-foreground/75">{item.shortDescription}</p>}
      {groups.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {groups.map(([k, label, Icon, items]) => (
            <section key={k} className="rounded-2xl bg-mist/70 p-5">
              <h4 className="flex items-center gap-2 font-display text-lg text-navy"><Icon className="h-5 w-5 text-gold-deep" aria-hidden="true" />{label}</h4>
              <ul className="mt-3 space-y-2 text-sm">{items.map((t, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" /><span className="min-w-0 break-words">{t}</span></li>)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-6 flex gap-2 rounded-2xl bg-gold-soft p-4 text-sm text-navy"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Career and outcome details for this {kind} are not published yet. Our counsellors can share verified information directly.</p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <BookButton ctx={ctx} size="" className="btn-hero" />
        <Link href={`/${kind === 'program' ? 'programs' : 'courses'}/${item.slug}`} className="btn btn-outline">Full details <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Pathways are listed as stored for this {kind}. Admission, jobs and salaries are never guaranteed.</p>
    </div>
  );
}

export default function Career() {
  const page = usePublicItem('pages', 'career-industry');
  const programsQ = usePublicList('programs');
  const coursesQ = usePublicList('courses');
  const certsQ = usePublicList('certifications');
  const p = page.data;
  useSeo({ ...seoFrom(p, { title: 'Career pathways', description: 'Explore stored career pathways, outcomes and projects for 4PL Academy programs and courses.' }) });
  const programs = useMemo(() => (programsQ.data || []).filter(ok), [programsQ.data]);
  const courses = useMemo(() => (coursesQ.data || []).filter(ok), [coursesQ.data]);
  const certs = useMemo(() => (certsQ.data || []).filter(ok), [certsQ.data]);
  const [mode, setMode] = useState('program');
  const [level, setLevel] = useState('');
  const [skill, setSkill] = useState('');
  const [term, setTerm] = useState('');
  const [sel, setSel] = useState(null);
  const levels = useMemo(() => uniq(programs.map((x) => x.degreeLevel)), [programs]);
  const skills = useMemo(() => uniq((mode === 'program' ? programs : courses).map(areaOf)), [courses, programs, mode]);
  const pool = (mode === 'program' ? programs.filter((x) => !level || x.degreeLevel === level) : courses).filter(x => !skill || areaOf(x) === skill);
  const t = term.trim().toLowerCase();
  const list = pool.filter((x) => !t || `${x.name} ${x.specialization || ''} ${x.category || ''} ${x.shortDescription || ''}`.toLowerCase().includes(t));
  const chosen = list.find((x) => `${mode}-${x.id}` === sel) || null;
  const loading = (mode === 'program' ? programsQ : coursesQ).isLoading;
  const err = (mode === 'program' ? programsQ : coursesQ).isError;
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Career' }]} eyebrow="Career and industry" title={p?.name && p.name.toLowerCase() !== 'career industry' ? p.name : 'Find the career path behind a program'} body={p?.shortDescription || 'Pick a program or a skill area and see only the pathways, outcomes and projects 4PL Academy has published for it.'}>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row"><BookButton size="" ctx={{ interestedIn: 'Career pathway' }} className="btn-hero" /><a href="#explorer" className="btn btn-light btn-hero">Open the explorer</a></div>
      </PageHero>
      <section id="explorer" className="container-x py-12 sm:py-16" aria-labelledby="career-explorer">
        <Reveal>
          <p className="eyebrow">Pathway explorer</p>
          <h2 id="career-explorer" className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Choose where you want to start</h2>
        </Reveal>
        {loading ? <div className="mt-8 grid gap-4 lg:grid-cols-[22rem_1fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div> : err ? <div className="mt-8"><ErrorState onRetry={() => { programsQ.refetch(); coursesQ.refetch(); }} /></div> : (
          <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2" role="group" aria-label="What are you exploring">
                <button type="button" className="pill-tab" aria-pressed={mode === 'program'} onClick={() => { setMode('program'); setSel(null); }}><GraduationCap className="mr-1.5 h-4 w-4" aria-hidden="true" />Degree programs</button>
                <button type="button" className="pill-tab" aria-pressed={mode === 'course'} onClick={() => { setMode('course'); setSel(null); }}><BookOpen className="mr-1.5 h-4 w-4" aria-hidden="true" />Professional courses</button>
              </div>
              {(mode === 'program' ? levels : skills).length > 0 && (
                <div className="mt-4"><p className="label">{mode === 'program' ? 'Level' : 'Skill area'}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="pill-tab" aria-pressed={!(mode === 'program' ? level : skill)} onClick={() => { mode === 'program' ? setLevel('') : setSkill(''); setSel(null); }}>All</button>
                    {(mode === 'program' ? levels : skills).map((l) => { const on = (mode === 'program' ? level : skill) === l; return <button key={l} type="button" className="pill-tab" aria-pressed={on} onClick={() => { mode === 'program' ? setLevel(l) : setSkill(l); setSel(null); }}>{l}</button>; })}
                  </div></div>
              )}
              {mode === 'program' && skills.length > 0 && (
                <label className="mt-4 block text-sm font-semibold text-navy">Skill area
                  <select className="input mt-2 w-full" value={skill} onChange={e => { setSkill(e.target.value); setSel(null); }}>
                    <option value="">All published areas</option>
                    {skills.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              )}
              <div className="relative mt-4"><label htmlFor="career-q" className="label">Interest</label><Search className="pointer-events-none absolute bottom-3.5 left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" /><input id="career-q" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Logistics, management, supply chain" className="input pl-10" /></div>
              <ul className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1" aria-label="Matching options">
                {list.map((x) => { const k = `${mode}-${x.id}`; const on = sel === k; return (
                  <li key={k}><button type="button" onClick={() => setSel(k)} aria-pressed={on} className={`w-full rounded-2xl border p-4 text-left transition ${on ? 'border-navy bg-navy text-surface' : 'border-line bg-card hover:border-gold'}`}>
                    <span className="block font-display text-base font-bold leading-snug">{x.name}</span>
                    <span className={`mt-1 block text-xs ${on ? 'text-surface/75' : 'text-muted-foreground'}`}>{[x.degreeLevel || x.category, x.specialization, x.duration].filter(has).join(' · ') || 'Details on request'}</span>
                  </button></li>); })}
              </ul>
              {!list.length && <div className="mt-4"><EmptyState title="Nothing matches yet" body="Clear a filter or change the interest to see published options." action={<button type="button" className="btn btn-outline btn-sm" onClick={() => { setTerm(''); setLevel(''); setSkill(''); }}>Reset filters</button>} /></div>}
            </div>
            <div className="min-w-0">
              {chosen ? <Result item={chosen} kind={mode} /> : (
                <div className="section-soft grid min-h-[20rem] place-items-center p-8 text-center">
                  <div className="max-w-sm"><span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-navy text-gold"><Briefcase className="h-6 w-6" aria-hidden="true" /></span>
                    <h3 className="text-xl font-bold text-navy">Select an option to see its pathway</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Only verified, published information is shown. If something is missing, we say so.</p></div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      {(has(p?.description) || lines(p?.careerPaths).length > 0) && (
        <section className="container-x pb-12"><div className="section-soft grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1fr]">
          <div><p className="eyebrow">How 4PL Academy approaches careers</p><div className="mt-4"><RichText text={p.description} /></div></div>
          <img src={has(p?.image) ? p.image : asset('images/industry-logistics.webp')} alt="" loading="lazy" className="h-auto w-full rounded-2xl object-cover" />
        </div></section>
      )}
      {certs.length > 0 && (
        <section className="container-x pb-12" aria-labelledby="career-certs">
          <h2 id="career-certs" className="text-2xl font-extrabold text-navy sm:text-3xl">Certifications in the catalogue</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{certs.map((c) => <li key={c.id} className="card-s flex items-start gap-3 p-4"><Award className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" /><div className="min-w-0"><p className="font-bold text-navy">{c.name}</p>{has(c.credentialType) && <p className="text-xs text-muted-foreground">{c.credentialType}</p>}</div></li>)}</ul>
          <Link href="/certifications" className="btn btn-outline mt-5">All certifications</Link>
        </section>
      )}
      <section className="container-x pb-16"><div className="navy-surface on-navy rounded-[1.75rem] p-8 sm:p-12 sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div><h2 className="text-2xl font-extrabold sm:text-4xl">Not sure which path fits you?</h2><p className="mt-2 max-w-xl text-surface/75">An admissions counsellor will walk through options using verified information only.</p></div>
        <div className="mt-6 sm:mt-0"><BookButton size="" className="btn-hero" ctx={{ interestedIn: 'Career pathway' }} /></div>
      </div></section>
    </>
  );
}
