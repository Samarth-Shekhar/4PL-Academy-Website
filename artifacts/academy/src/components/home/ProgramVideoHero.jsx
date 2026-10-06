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
  const label = cur ? (cur.caption || cur.name) : '';
  return (
    <section ref={wrap} className="hero-card navy-surface on-navy grain relative min-h-[34rem] sm:min-h-[36rem] lg:min-h-[40rem] overflow-hidden" aria-label="Featured programs in motion" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="absolute inset-0 -z-10 bg-navy" aria-hidden="true">
        <AnimatePresence initial={false}>
          {cur && (
            <motion.div key={`${cur.id}-${idx}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: 'easeInOut' }}>
              {asVideo ? <video ref={vid} src={mediaUrl(cur.url)} poster={still || undefined} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
                : still ? <img {...(cur.type === 'video' ? { src: still } : srcs(cur.url))} sizes="100vw" alt={cur.altText || ''} className={cn('h-full w-full object-cover', idx % 2 ? 'kb-b' : 'kb-a', !running && 'kb-paused')} fetchPriority={idx === 0 ? 'high' : undefined} decoding="async" /> : null}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy via-navy/70 to-transparent" />
      </div>
      <div className="container-x flex min-h-[34rem] sm:min-h-[36rem] lg:min-h-[40rem] flex-col justify-end pb-5 pt-14 sm:pt-16">
        <div className="max-w-4xl">
          <motion.p initial={reduce || light ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-pill mb-4">4PL Academy</motion.p>
          <h1 className="hero-title text-surface text-[clamp(2rem,8vw,3.6rem)] sm:text-6xl lg:text-7xl">
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
          <div className="mt-6 border-t border-surface/15 pt-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Hero media controls">
                <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-surface/40 text-surface hover:border-gold hover:text-gold disabled:opacity-40" onClick={() => pick(-1)} disabled={n < 2} aria-label="Previous visual"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-surface/40 text-surface hover:border-gold hover:text-gold disabled:opacity-40" onClick={() => pick(1)} disabled={n < 2} aria-label="Next visual"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <div className="min-w-0 flex-1 text-sm text-surface/85" aria-live={running ? 'off' : 'polite'}>
                <span className="text-xs font-bold uppercase tracking-wider text-gold">{String(idx % n + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
                <span className="ml-2 font-bold text-surface">{cur?.name}</span>
                {has(cur?.caption) && <span className="ml-2 text-surface/75">{cur.caption}</span>}
                {prog && has(prog.universityName) && <span className="ml-2 text-xs text-surface/60">{prog.universityName}</span>}
                {prog?.slug && <Link href={`/programs/${prog.slug}`} className="ml-3 inline-flex items-center gap-1 text-xs font-bold text-gold underline underline-offset-2">Program details<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
              </div>
            </div>
            {n > 1 && (
              <ul className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Choose a program visual">
                {slides.map((m, i) => (
                  <li key={m.id} className="shrink-0">
                    <button type="button" onClick={() => { setPlaying(false); setIdx(i); }} aria-current={i === idx % n} className={cn('group relative block w-36 overflow-hidden rounded-lg border text-left sm:w-44', i === idx % n ? 'border-gold' : 'border-surface/25 hover:border-surface/60')}>
                      <span className="block h-14 bg-navy-2 sm:h-20">{(m.thumbnailUrl || m.posterUrl || m.type === 'image') && <img src={mediaUrl(m.thumbnailUrl || m.posterUrl || m.url)} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 group-hover:opacity-100" />}</span>
                      <span className="block min-h-[2.4rem] bg-navy/90 px-2 py-1 text-[0.68rem] font-bold leading-tight text-surface">{m.name}</span>
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
