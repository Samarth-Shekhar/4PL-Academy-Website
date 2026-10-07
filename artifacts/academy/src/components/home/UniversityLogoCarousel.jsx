import { useState } from 'react';
import { Link } from 'wouter';
import { usePublicList } from '@/lib/api';
import { has, initials } from '@/lib/format';
import { mediaUrl } from '@/lib/home';
import { Skeleton } from '@/components/ui-kit';
import { Head, Body, CtaRow } from './shared';
import { MovingCards } from './MovingCards';

function Tile({ u }) {
  const [bad, setBad] = useState(false);
  return (
    <Link href={`/universities/${u.slug}`} className="group flex h-36 w-48 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-card p-4 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-56" data-testid={`link-university-logo-${u.id}`}>
      <span className="grid h-16 w-full place-items-center">{has(u.logo) && !bad ? <img src={mediaUrl(u.logo)} alt={`${u.name} logo`} className="max-h-16 max-w-[9rem] object-contain" loading="lazy" draggable="false" onError={() => setBad(true)} /> : <span className="font-display text-2xl text-navy">{initials(u.name)}</span>}</span>
      <span className="line-clamp-2 text-center text-xs font-semibold text-navy/80 group-hover:text-navy">{u.name}</span>
    </Link>
  );
}

export function UniversityLogoCarousel({ s }) {
  const q = usePublicList('universities', undefined, { refetchOnWindowFocus: true });
  const list = (q.data || []).filter((u) => has(u.logo) && has(u.slug) && u.status !== 'archived' && u.status !== 'draft');
  return (
    <section className="bg-mist/60 py-16 sm:py-24" aria-labelledby="sec-university-logos">
      <div className="container-x">
        <div id="sec-university-logos"><Head s={s} /><Body s={s} /><CtaRow s={s} className="mt-6" /></div>
      </div>
      {q.isLoading ? <div className="container-x mt-8"><Skeleton className="h-36" /></div> : list.length > 0 && <MovingCards label="University logos" items={list} speed={36} render={(u) => <Tile u={u} />} />}
    </section>
  );
}
