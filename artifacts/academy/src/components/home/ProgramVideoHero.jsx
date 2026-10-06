import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { bySection, mediaUrl, saveData, useInView, useMatch, useMedia, useTabVisible, useVerified } from '@/lib/home';
import { bookHref } from '@/lib/booking';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Cta } from './shared';
import BlurText from '../reactbits/BlurText';

const norm = (x) => String(x || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const rank = (p) => (/sushant/i.test(p.universityName || '') ? 0 : 1);
const srcs = (u) => { const m = /^(.*)-4k\.webp$/.test(String(u || '')) ? String(u).replace(/-4k\.webp$/, '') : ''; return m ? { src: mediaUrl(`${m}-1920.webp`), srcSet: `${mediaUrl(`${m}-960.webp`)} 960w, ${mediaUrl(`${m}-1920.webp`)} 1920w, ${mediaUrl(u)} 3840w` } : { src: mediaUrl(u), srcSet: undefined }; };
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
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const { list: progs } = useVerified('programs');
  const vid = useRef(null);
  const n = slides.length;
  const cur = slides[idx % Math.max(n, 1)];
  const prog = cur ? progs.filter((p) => norm(p.name) === norm(cur.name) && (cur.universityId == null || p.universityId === cur.universityId)).sort((a, b) => rank(a) - rank(b) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.slug).localeCompare(String(b.slug)))[0] : null;
  const book = bookHref(prog ? { program: prog.name, university: prog.universityName } : cur?.universityId == null && cur?.name && cur.id !== 'cover' ? { program: cur.name } : {});
  const motionAllowed = playing && inView && tab && !hovering && !focused;
  const running = motionAllowed && n > 1;
  const go = useCallback((d) => setIdx((i) => (i + d + n) % n), [n]);
  const pick = (d) => { setPlaying(false); go(d); };
  useEffect(() => { if (reduce) setPlaying(false); }, [reduce]);
  useEffect(() => { if (!running) return undefined; const t = setTimeout(() => go(1), cur?.type === 'video' && !light ? secs(cur.duration) * 1000 : 6800); return () => clearTimeout(t); }, [running, idx, cur, light, go]);
  useEffect(() => { const v = vid.current; if (!v) return; if (motionAllowed) v.play?.().catch(() => {}); else v.pause?.(); }, [motionAllowed, idx]);
  const still = cur ? (cur.type === 'video' ? mediaUrl(cur.posterUrl || cur.thumbnailUrl) : mediaUrl(cur.url)) : '';
  const asVideo = cur?.type === 'video' && !light;
  const words = String(section?.name || fallbackTitle || '4PL Academy').split(/\s+/);
  return (
    <section ref={wrap} className="navy-surface on-navy relative min-h-[min(88svh,54rem)] overflow-hidden" aria-label="Featured programs in motion" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="absolute inset-0 -z-10 bg-navy" aria-hidden="true">
        <AnimatePresence initial={false}>
          {cur && (
            <motion.div key={`${cur.id}-${idx}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 1.8, ease: 'easeInOut' }}>
              {asVideo ? <video ref={vid} src={mediaUrl(cur.url)} poster={still || undefined} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
                : still ? <img {...(cur.type === 'video' ? { src: still } : srcs(cur.url))} sizes="100vw" alt={cur.altText || ''} className={cn('h-full w-full object-cover object-[65%_center] sm:object-center', idx % 2 ? 'kb-b' : 'kb-a', !running && 'kb-paused')} fetchPriority={idx === 0 ? 'high' : undefined} decoding="async" /> : null}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-navy/10" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy/70 via-navy/25 to-transparent" />
      </div>
      <div className="container-x flex min-h-[min(88svh,54rem)] flex-col justify-center pb-10 pt-20">
        <div className="max-w-4xl">
          <motion.p key={cur?.id || 'brand'} initial={reduce || light ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-pill mb-4">{String(cur?.name || '4PL Academy').replace(/^(?:BBA in |MBA \/ PGDM in |MBA \+ PGPM in )/, '')}</motion.p>
          <h1 className="hero-title text-surface text-[clamp(1.9rem,10vw,4.5rem)] sm:text-7xl lg:text-[6rem]">
            {words.map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-visible align-bottom sm:overflow-hidden">
                <motion.span className={cn('inline-block', i === words.length - 1 && 'text-gold')} initial={reduce || light ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.09, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          {BlurText && !reduce && !light && has(section?.shortDescription || fallbackBody) && String(section?.shortDescription || fallbackBody).length < 220
            ? <div className="mt-4 max-w-xl text-base leading-relaxed text-surface/85 sm:text-lg"><span className="sr-only">{section?.shortDescription || fallbackBody}</span><span aria-hidden="true"><BlurText text={String(section?.shortDescription || fallbackBody)} delay={40} animateBy="words" direction="top" className="flex-wrap" /></span></div>
            : <motion.p initial={reduce || light ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 max-w-xl text-base leading-relaxed text-surface/85 sm:text-lg">{section?.shortDescription || fallbackBody}</motion.p>}
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {(() => {
              const a = { label: section?.ctaLabel || (section ? '' : 'Explore programs'), url: section?.ctaUrl || '/programs', testid: 'link-hero-programs' };
              const b = { label: section?.secondaryCtaLabel || (section ? '' : 'Book Counselling'), url: section?.secondaryCtaUrl || '/book-counselling', testid: 'button-hero-bot' };
              const isBook = (x) => /counsel|book/i.test(`${x.label} ${x.url}`);
              const bookB = isBook(b) || !isBook(a);
              const [first, second] = bookB ? [b, a] : [a, b];
              return <><Cta {...first} url={isBook(first) && first.url !== 'bot' ? book : first.url} className="btn-hero" /><Cta {...second} url={isBook(second) && second.url !== 'bot' ? book : second.url} variant="light" className="btn-hero" /></>;
            })()}
          </motion.div>
          <form onSubmit={(e) => { e.preventDefault(); nav(`/programs${q ? `?search=${encodeURIComponent(q)}` : ''}`); }} className="mt-5 flex max-w-lg gap-2 rounded-full bg-surface/10 p-1.5 ring-1 ring-surface/30 backdrop-blur-sm" role="search">
            <label htmlFor="hero-search" className="sr-only">Search programs and universities</label>
            <input id="hero-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MBA, BBA, logistics" className="input rounded-full border-transparent bg-surface" />
            <button type="submit" className="btn btn-gold px-4 !rounded-full" aria-label="Search programs"><Search className="h-5 w-5" /></button>
          </form>
          <p className="mt-3 max-w-xl text-xs text-surface/60">Admission, training and placement support. Outcomes are never guaranteed.</p>
        </div>
        {n > 0 && (
          <div className="mt-8 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Hero media controls">
                <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-surface/40 text-surface hover:border-gold hover:text-gold disabled:opacity-40" onClick={() => pick(-1)} disabled={n < 2} aria-label="Previous visual"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-surface/40 text-surface hover:border-gold hover:text-gold disabled:opacity-40" onClick={() => pick(1)} disabled={n < 2} aria-label="Next visual"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <div className="min-w-0 flex-1 text-sm text-surface/85" aria-live={running ? 'off' : 'polite'}>
                <span className="text-xs font-bold uppercase tracking-wider text-gold">{String(idx % n + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
                <AnimatePresence mode="wait" initial={false}><motion.span key={cur?.id} className="ml-2 inline-block font-bold text-surface" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>{cur?.name}</motion.span></AnimatePresence>
                {prog && has(prog.universityName) && <span className="ml-2 text-xs text-surface/60">{prog.universityName}</span>}
                {prog?.slug && <Link href={`/programs/${prog.slug}`} className="ml-3 inline-flex items-center gap-1 text-xs font-bold text-gold underline underline-offset-2">Program details<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
              </div>
            </div>
            {n > 1 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Choose a program visual">
                {slides.map((m, i) => (
                  <li key={m.id}><button type="button" onClick={() => { setPlaying(false); setIdx(i); }} aria-current={i === idx % n} aria-label={m.name} title={m.name} className="grid h-8 w-8 place-items-center"><span className={cn('block h-1 rounded-full transition-all duration-500', i === idx % n ? 'w-8 bg-gold' : 'w-4 bg-surface/40')} /></button></li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
