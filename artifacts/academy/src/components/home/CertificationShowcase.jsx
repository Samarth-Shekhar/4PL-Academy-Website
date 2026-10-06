import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock, Award } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { REFRESH, mediaUrl, useVerified } from '@/lib/home';
import { has, initials } from '@/lib/format';
import { Head, Body, CtaRow } from './shared';
import { CompanyLogoStrip } from './CompanyLogoStrip';

function Mark({ c }) {
  const [bad, setBad] = useState(false);
  return <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">{has(c.logo) && !bad ? <img src={mediaUrl(c.logo)} alt={`${c.issuer || c.name} logo`} className="max-h-12 max-w-12 object-contain" loading="lazy" onError={() => setBad(true)} /> : <span className="font-display text-lg text-navy">{initials(c.issuer || c.name)}</span>}</span>;
}

export function CertificationShowcase({ s }) {
  const { list } = useVerified('certifications');
  const courses = usePublicList('courses', undefined, { refetchOnWindowFocus: true }).data || [];
  const programs = usePublicList('programs', undefined, { refetchOnWindowFocus: true }).data || [];
  const row = useRef(null);
  const reduce = useReducedMotion();
  const by = (d) => row.current?.scrollBy({ left: d * 340, behavior: reduce ? 'auto' : 'smooth' });
  return (
    <section className="bg-mist/70 py-20 sm:py-28" aria-labelledby="sec-certifications">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div id="sec-certifications"><Head s={s} /><Body s={s} /></div>
          <div className="flex items-center gap-3"><CtaRow s={s} />{list.length > 2 && <div className="hidden gap-2 sm:flex"><button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-navy/30 text-navy hover:border-navy" onClick={() => by(-1)} aria-label="Previous certifications"><ChevronLeft className="h-5 w-5" /></button><button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-navy/30 text-navy hover:border-navy" onClick={() => by(1)} aria-label="Next certifications"><ChevronRight className="h-5 w-5" /></button></div>}</div>
        </div>
        <div className="mt-10">
          <CompanyLogoStrip />
          {!list.length ? (
            <p className="mt-4 text-sm text-muted-foreground">Credentials are listed only after the issuer and course details are verified. <Link href="/courses" className="font-semibold text-navy underline underline-offset-4">Explore professional courses</Link></p>
          ) : (
            <div ref={row} className="snap-row mt-8 -mx-4 px-4 pb-3 sm:mx-0 sm:px-0" tabIndex={0} role="region" aria-label="Certifications">
              {list.map((c, i) => {
                const co = courses.find((x) => x.id === c.courseId); const pr = programs.find((x) => x.id === c.programId);
                const link = co ? { to: `/courses/${co.slug}`, ext: false } : pr ? { to: `/programs/${pr.slug}`, ext: false } : has(c.websiteUrl) ? { to: c.websiteUrl, ext: true } : null;
                const cls = 'btn btn-navy btn-sm mt-auto';
                return (
                  <motion.article key={c.id} initial={reduce ? false : { opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: Math.min(i, 4) * 0.07, duration: 0.5 }} className="flex w-[17.5rem] flex-col rounded-lg border border-line border-t-4 border-t-gold bg-card p-5 sm:w-80" data-testid={`card-certification-${c.id}`}>
                    <div className="flex items-start gap-3"><Mark c={c} /><div className="min-w-0"><h3 className="text-xl leading-snug text-navy">{c.name}</h3>{has(c.issuer) && <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-gold-deep">{c.issuer}</p>}</div></div>
                    {has(c.description) && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{c.description}</p>}
                    <dl className="mt-4 space-y-1.5 text-sm">
                      {(co || pr) && <div className="flex gap-2"><dt className="text-muted-foreground">Linked to</dt><dd className="font-semibold text-navy">{(co || pr).name}</dd></div>}
                      {has(c.duration) && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-deep" aria-hidden="true" /><dd>{c.duration}</dd></div>}
                      {has(c.credentialType) && <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-deep" aria-hidden="true" /><dd>{c.credentialType}</dd></div>}
                    </dl>
                    <div className="mt-5 flex">{link ? (link.ext ? <a href={link.to} target="_blank" rel="noopener noreferrer" className={cls}>Explore Certification <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a> : <Link href={link.to} className={cls}>Explore Certification <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>) : <span className="text-xs text-muted-foreground">Details to be confirmed</span>}</div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
