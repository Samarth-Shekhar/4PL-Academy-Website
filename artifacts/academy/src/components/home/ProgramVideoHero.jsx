import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Search } from 'lucide-react';
import { bySection, mediaUrl, saveData, useInView, useMatch, useMedia, useTabVisible } from '@/lib/home';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Cta } from './shared';

const secs = (d) => { const n = parseInt(String(d || ''), 10); return Number.isFinite(n) && n > 2 ? Math.min(n, 14) : 9; };

export function ProgramVideoHero({ section, fallbackTitle, fallbackBody }) {
  const { list } = useMedia();
  const reduce = useReducedMotion();
  const mobile = useMatch('(max-width: 767px)');
  const tab = useTabVisible();
  const [wrap, inView] = useInView();
  const [, nav] = useLocation();
  const [q, setQ] = useState('');
  const hero = bySection(list, 'hero');
  const slides = hero.length ? hero : has(section?.image) ? [{ id: 'cover', name: section.name, type: 'image', url: section.image, altText: '' }] : [];
  const light = mobile || reduce || saveData();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const vid = useRef(null);
  const n = slides.length;
  const cur = slides[idx % Math.max(n, 1)];
  const running = playing && inView && tab && n > 1;
  const go = useCallback((d) => setIdx((i) => (i + d + n) % n), [n]);
  useEffect(() => { if (reduce) setPlaying(false); }, [reduce]);
  useEffect(() => { if (!running) return undefined; const t = setTimeout(() => go(1), cur?.type === 'video' && !light ? secs(cur.duration) * 1000 : 6800); return () => clearTimeout(t); }, [running, idx, cur, light, go]);
  useEffect(() => { const v = vid.current; if (!v) return; if (running || (n === 1 && inView && tab && playing)) v.play?.().catch(() => {}); else v.pause?.(); }, [running, n, inView, tab, playing, idx]);
  const still = cur ? (cur.type === 'video' ? mediaUrl(cur.posterUrl || cur.thumbnailUrl) : mediaUrl(cur.url)) : '';
  const asVideo = cur?.type === 'video' && !light;
  const words = String(section?.name || fallbackTitle || '4PL Academy').split(/\s+/);
  const label = cur ? (cur.caption || cur.name) : '';
  return (
    <section ref={wrap} className="navy-surface on-navy grain relative min-h-[100svh] overflow-hidden" aria-label="Featured programs in motion">
      <div className="absolute inset-0 -z-10 bg-navy" aria-hidden="true">
        <AnimatePresence initial={false}>
          {cur && (
            <motion.div key={`${cur.id}-${idx}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: 'easeInOut' }}>
              {asVideo ? <video ref={vid} src={mediaUrl(cur.url)} poster={still || undefined} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
                : still ? <img src={still} alt="" className={cn('h-full w-full object-cover', idx % 2 ? 'kb-b' : 'kb-a', !running && 'kb-paused')} fetchPriority={idx === 0 ? 'high' : undefined} decoding="async" /> : null}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/25" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy via-navy/70 to-transparent" />
      </div>
      <div className="container-x flex min-h-[100svh] flex-col justify-end pb-6 pt-28 sm:pt-32">
        <div className="max-w-4xl">
          <motion.p initial={reduce || light ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-5 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />4PL Academy</motion.p>
          <h1 className="display-xl text-surface max-sm:text-[clamp(2rem,8.5vw,3.5rem)] max-sm:leading-[1.12]">
            {words.map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-visible align-bottom sm:overflow-hidden">
                <motion.span className={cn('inline-block', i === words.length - 1 && 'text-gold')} initial={reduce || light ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.09, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={reduce || light ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 max-w-xl text-lg leading-relaxed text-surface/85 sm:text-xl">{section?.shortDescription || fallbackBody}</motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Cta label={section?.ctaLabel || (section ? '' : 'Explore programs')} url={section?.ctaUrl || '/programs'} testid="link-hero-programs" />
            <Cta label={section?.secondaryCtaLabel || (section ? '' : 'Book Counselling')} url={section?.secondaryCtaUrl || '/book-counselling'} variant="light" testid="button-hero-bot" />
          </motion.div>
          <form onSubmit={(e) => { e.preventDefault(); nav(`/programs${q ? `?search=${encodeURIComponent(q)}` : ''}`); }} className="mt-6 flex max-w-lg gap-2 rounded-md bg-surface/10 p-1.5 ring-1 ring-surface/25 backdrop-blur-sm" role="search">
            <label htmlFor="hero-search" className="sr-only">Search programs and universities</label>
            <input id="hero-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MBA, BBA, logistics" className="input border-transparent bg-surface" />
            <button type="submit" className="btn btn-gold px-4" aria-label="Search programs"><Search className="h-5 w-5" /></button>
          </form>
          <p className="mt-3 max-w-xl text-xs text-surface/60">Admission, training and placement support. Outcomes are never guaranteed.</p>
        </div>
        {n > 0 && (
          <div className="mt-10 border-t border-surface/20 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Hero media controls">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-surface/40 text-surface hover:border-gold hover:text-gold disabled:opacity-40" onClick={() => go(-1)} disabled={n < 2} aria-label="Previous visual"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-gold text-navy disabled:opacity-40" onClick={() => setPlaying((p) => !p)} disabled={n < 1} aria-label={playing ? 'Pause motion' : 'Play motion'} aria-pressed={!playing} data-testid="button-hero-playpause">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-surface/40 text-surface hover:border-gold hover:text-gold disabled:opacity-40" onClick={() => go(1)} disabled={n < 2} aria-label="Next visual"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <p className="min-w-0 flex-1 text-xs text-surface/70" aria-live="polite">
                <span className="font-bold uppercase tracking-wider text-gold">{String(idx % n + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>{label ? ` · ${label}` : ''}{cur?.universityId ? '' : ' · Illustrative imagery, not an actual institution or 4PL event'}
              </p>
            </div>
            {n > 1 && (
              <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Choose a program visual">
                {slides.map((m, i) => (
                  <li key={m.id} className="shrink-0">
                    <button type="button" onClick={() => setIdx(i)} aria-current={i === idx % n} className={cn('group relative block w-36 overflow-hidden rounded-md border text-left sm:w-44', i === idx % n ? 'border-gold' : 'border-surface/25 hover:border-surface/60')}>
                      <span className="block h-14 bg-navy-2 sm:h-16">{(m.thumbnailUrl || m.posterUrl || m.type === 'image') && <img src={mediaUrl(m.thumbnailUrl || m.posterUrl || m.url)} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 group-hover:opacity-100" />}</span>
                      <span className="block truncate bg-navy/90 px-2 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-surface">{m.name}</span>
                      {i === idx % n && <motion.span key={`${idx}-${running}`} className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gold" initial={{ scaleX: 0 }} animate={{ scaleX: running ? 1 : 0 }} transition={{ duration: running ? 6.8 : 0, ease: 'linear' }} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
