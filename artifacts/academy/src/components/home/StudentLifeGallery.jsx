import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { bySection, useMedia } from '@/lib/home';
import { cn } from '@/lib/cn';
import { Head, Body, CtaRow, Pending, Illustrative } from './shared';
import { MediaMasonry, toTile } from './MediaMasonry';

export function StudentLifeGallery({ s }) {
  const { list } = useMedia();
  const media = bySection(list, 'student-life').map(toTile);
  const fromItems = (s.items || []).filter((i) => i.image).map((i, k) => ({ key: `i${k}`, type: 'image', src: i.image, alt: i.altText, caption: i.name }));
  const tiles = media.length ? media : fromItems;
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="sec-student-life">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div id="sec-student-life" className="lg:sticky lg:top-28 lg:self-start"><Head s={s} /><Body s={s} /><CtaRow s={s} className="mt-7" />{!media.length && tiles.length > 0 && <Illustrative className="mt-6" />}</div>
        {tiles.length ? <MediaMasonry items={tiles} /> : <Pending title="Student stories are being gathered" body="We publish only university-approved campus and student media."><Link href="/student-life" className="btn btn-navy">Student life</Link></Pending>}
      </div>
    </section>
  );
}

export function GalleryShowcase({ s }) {
  const { list } = useMedia();
  const all = bySection(list, 'gallery');
  const cats = useMemo(() => [...new Set(all.map((m) => m.category).filter(Boolean))], [all]);
  const [cat, setCat] = useState('');
  const tiles = all.filter((m) => !cat || m.category === cat).map(toTile);
  return (
    <section className="bg-mist/70 py-20 sm:py-28" aria-labelledby="sec-gallery">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div id="sec-gallery"><Head s={s} /><Body s={s} /></div><CtaRow s={s} /></div>
        {cats.length > 1 && <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto" role="group" aria-label="Filter by category">{['', ...cats].map((c) => <button key={c || 'all'} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold', cat === c ? 'border-navy bg-navy text-surface' : 'border-line bg-card text-navy')}>{c || 'All'}</button>)}</div>}
        <div className="mt-8">{tiles.length ? <MediaMasonry items={tiles} drift={false} /> : <Pending title="The gallery is being curated" body="Photos and videos appear here after they are approved by 4PL Academy or the institution concerned."><Link href="/student-life" className="btn btn-navy">Student life</Link></Pending>}</div>
      </div>
    </section>
  );
}
