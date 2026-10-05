import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';
import { mediaUrl } from '@/lib/home';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Pic } from './shared';

const ASP = ['aspect-[4/5]', 'aspect-square', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[5/4]'];

function Tile({ it, i, drift }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [play, setPlay] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const amp = drift && !reduce ? (i % 2 ? 18 : -18) : 0;
  const y = useTransform(scrollYProgress, [0, 1], [amp, -amp]);
  const video = it.type === 'video';
  return (
    <motion.figure ref={ref} style={{ y }} className="mb-3 break-inside-avoid overflow-hidden rounded-lg bg-navy sm:mb-4" data-testid={`tile-media-${it.key}`}>
      <div className={cn('relative', ASP[i % ASP.length])}>
        {video && play ? <video src={mediaUrl(it.src)} poster={mediaUrl(it.poster) || undefined} controls autoPlay muted playsInline className="h-full w-full object-cover" />
          : <Pic src={video ? it.poster : it.src} alt={it.alt || it.caption || ''} label={it.caption} className="h-full w-full" />}
        {video && !play && <button type="button" className="absolute inset-0 grid place-items-center bg-navy/30 text-navy" onClick={() => setPlay(true)} aria-label={`Play video${it.caption ? `: ${it.caption}` : ''}`}><span className="grid h-14 w-14 place-items-center rounded-full bg-gold"><Play className="h-6 w-6" /></span></button>}
        {(has(it.caption) || has(it.category)) && !play && <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-3 pt-10 text-surface">{has(it.category) && <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-gold">{it.category}</span>}{has(it.caption) && <span className="block text-sm leading-snug">{it.caption}</span>}</figcaption>}
      </div>
    </motion.figure>
  );
}
export function MediaMasonry({ items, drift = true, className }) {
  return <div className={cn('columns-2 gap-3 sm:gap-4 lg:columns-3', className)}>{items.map((it, i) => <Tile key={it.key} it={it} i={i} drift={drift} />)}</div>;
}
export const toTile = (m) => ({ key: `m${m.id}`, type: m.type, src: m.url, poster: m.posterUrl || m.thumbnailUrl, alt: m.altText, caption: m.caption || m.name, category: m.category });
