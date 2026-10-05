import { useState } from 'react';
import { Link } from 'wouter';
import { useVerified, REL_LABEL, mediaUrl } from '@/lib/home';
import { has } from '@/lib/format';
import { Head, Body, CtaRow, Pending, Pic } from './shared';
import { Skeleton } from '@/components/ui-kit';

function Logo({ c, hidden }) {
  const [bad, setBad] = useState(false);
  const inner = (
    <>
      <span className="grid h-16 w-full place-items-center">{has(c.logo) && !bad ? <img src={mediaUrl(c.logo)} alt={hidden ? '' : `${c.name} logo`} className="max-h-14 max-w-[8.5rem] object-contain" loading="lazy" width="136" height="56" onError={() => setBad(true)} /> : <span className="font-display text-xl text-navy">{c.name}</span>}</span>
      <span className="mt-2 block text-center text-[0.68rem] font-bold uppercase tracking-wider text-gold-deep">{REL_LABEL[c.relationshipType] || REL_LABEL.Other}</span>
    </>
  );
  const cls = 'block h-[7.5rem] w-48 shrink-0 rounded-lg border border-line bg-card p-4 transition hover:border-gold sm:w-56';
  return has(c.websiteUrl) ? <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className={cls} tabIndex={hidden ? -1 : 0} aria-label={hidden ? undefined : `${c.name}, ${REL_LABEL[c.relationshipType] || 'associated company'} (opens website)`}>{inner}</a> : <div className={cls}>{inner}</div>;
}

export function IndustryLogoMarquee({ s }) {
  const { list, isLoading } = useVerified('industry_companies');
  const [paused, setPaused] = useState(false);
  const items = s.items || [];
  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28" aria-labelledby="sec-industry">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div id="sec-industry"><Head s={s} /><Body s={s} /><CtaRow s={s} className="mt-7" /></div>
          {has(s.image) && <div className="hidden aspect-[16/10] overflow-hidden rounded-lg lg:block"><Pic src={s.image} alt="" className="h-full w-full" /></div>}
        </div>
        {items.length > 0 && <ul className="mt-12 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">{items.map((it, i) => <li key={it.name + i} className="bg-card p-5"><h3 className="text-lg text-navy">{it.name}</h3>{has(it.description) && <p className="mt-1.5 text-sm text-muted-foreground">{it.description}</p>}</li>)}</ul>}
      </div>
      <div className="mt-12">
        {isLoading ? <div className="container-x"><Skeleton className="h-28" /></div> : !list.length ? (
          <div className="container-x"><Pending title="Industry relationships are being verified" body="Company logos appear here only after 4PL Academy verifies the relationship and labels it accurately, for example hiring partner or corporate client."><Link href="/career-industry" className="btn btn-navy">Career and industry</Link><Link href="/for-universities" className="btn btn-outline">Work with 4PL</Link></Pending></div>
        ) : (
          <>
            <div className={`marquee relative overflow-hidden ${paused ? 'marquee-paused' : ''}`} role="region" aria-label="Verified industry companies" tabIndex={0} onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); } }}>
              <div className="marquee-track gap-4 pr-4" style={{ animationDuration: `${Math.max(list.length * 7, 28)}s` }}>
                {list.map((c) => <Logo key={c.id} c={c} />)}
                {list.length < 6 && list.map((c) => <Logo key={`x${c.id}`} c={c} hidden />)}
                <div className="marquee-dup flex gap-4" aria-hidden="true">{list.map((c) => <Logo key={`d${c.id}`} c={c} hidden />)}{list.length < 6 && list.map((c) => <Logo key={`dx${c.id}`} c={c} hidden />)}</div>
              </div>
            </div>
            <div className="container-x mt-3 flex items-center justify-between"><p className="text-xs text-muted-foreground">Each company is shown with its verified relationship type.</p><button type="button" className="text-xs font-bold uppercase tracking-wider text-navy underline-offset-4 hover:underline" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button></div>
          </>
        )}
      </div>
    </section>
  );
}
