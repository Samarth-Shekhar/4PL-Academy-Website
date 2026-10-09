import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Clock, Award } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { mediaUrl, useVerified } from '@/lib/home';
import { has, initials } from '@/lib/format';
import { Head, Body, CtaRow } from './shared';
import { MovingCards } from './MovingCards';
import { CompanyLogoStrip } from './CompanyLogoStrip';

function Mark({ c }) {
  const [bad, setBad] = useState(false);
  return <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">{has(c.logo) && !bad ? <img src={mediaUrl(c.logo)} alt={`${c.issuer || c.name} logo`} className="max-h-12 max-w-12 object-contain" loading="lazy" onError={() => setBad(true)} /> : <span className="font-display text-lg text-navy">{initials(c.issuer || c.name)}</span>}</span>;
}

export function CertificationShowcase({ s }) {
  const { list } = useVerified('certifications');
  const courses = usePublicList('courses', undefined, { refetchOnWindowFocus: true }).data || [];
  const programs = usePublicList('programs', undefined, { refetchOnWindowFocus: true }).data || [];
  return (
    <section className="bg-mist/70 py-14 sm:py-20" aria-labelledby="sec-certifications" data-testid="section-home-certifications">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div id="sec-certifications"><Head s={s} /><Body s={s} /></div>
          <div className="flex items-center gap-3"><CtaRow s={s} /></div>
        </div>
        <div className="mt-10">
          {!list.length ? (
            <div>
              {courses.length > 0 && <><h3 className="mb-5 text-xl text-navy">Professional learning pathways</h3><MovingCards items={courses} label="Professional courses" speed={24} render={(c) => <Link href={`/professional-courses/${c.slug}`} data-testid={`link-credential-course-${c.slug}`} className="flex h-full w-72 flex-col justify-between gap-5 rounded-2xl border border-navy/10 bg-white p-6 text-navy"><span className="font-display text-lg font-bold">{c.name}</span>{has(c.shortDescription) && <span className="text-sm leading-relaxed text-muted-foreground">{c.shortDescription}</span>}<span className="flex items-center gap-2 text-sm font-bold text-gold-deep">View course <ArrowUpRight className="h-4 w-4" /></span></Link>} /></>}
              <Link href="/professional-courses" className="mt-4 inline-block font-semibold text-navy underline underline-offset-4">Explore all professional courses</Link>
            </div>
          ) : (
            <MovingCards items={list} label="Certifications" speed={24} render={(c) => {
                const co = courses.find((x) => x.id === c.courseId); const pr = programs.find((x) => x.id === c.programId);
                 const link = co ? { to: `/professional-courses/${co.slug}`, ext: false } : pr ? { to: `/programs/${pr.slug}`, ext: false } : has(c.websiteUrl) ? { to: c.websiteUrl, ext: true } : null;
                const cls = 'btn btn-navy btn-sm mt-auto';
                return (
                  <article className="flex h-full w-[17.5rem] flex-col rounded-lg border border-line border-t-4 border-t-gold bg-card p-5 sm:w-80" data-testid={`card-certification-${c.id}`}>
                    <div className="flex items-start gap-3"><Mark c={c} /><div className="min-w-0"><h3 className="text-xl leading-snug text-navy">{c.name}</h3>{has(c.issuer) && <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-gold-deep">{c.issuer}</p>}</div></div>
                    {has(c.description) && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{c.description}</p>}
                    <dl className="mt-4 space-y-1.5 text-sm">
                      {(co || pr) && <div className="flex gap-2"><dt className="text-muted-foreground">Linked to</dt><dd className="font-semibold text-navy">{(co || pr).name}</dd></div>}
                      {has(c.duration) && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-deep" aria-hidden="true" /><dd>{c.duration}</dd></div>}
                      {has(c.credentialType) && <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-deep" aria-hidden="true" /><dd>{c.credentialType}</dd></div>}
                    </dl>
                    <div className="mt-5 flex">{link ? (link.ext ? <a href={link.to} target="_blank" rel="noopener noreferrer" className={cls}>Explore Certification <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a> : <Link href={link.to} className={cls}>Explore Certification <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>) : <Link href="/contact" className={cls}>Ask about this credential</Link>}</div>
                  </article>
                );
              }} />
          )}
        </div>
        <div className="mt-10 border-t border-navy/10 pt-8"><CompanyLogoStrip label="Industry perspectives" /></div>
      </div>
    </section>
  );
}
