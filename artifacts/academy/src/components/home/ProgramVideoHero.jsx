import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { bySection, mediaUrl, saveData, useInView, useMatch, useMedia, useTabVisible, useVerified } from '@/lib/home';
import { bookHref } from '@/lib/booking';
import { usePublicList } from '@/lib/api';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Cta } from './shared';

const norm = (x) => String(x || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const rank = (p) => (/sushant/i.test(p.universityName || '') ? 0 : 1);
const srcs = (u) => {
  const url = String(u || '');
  const m = /^(.*)-(?:4k|1920)\.webp$/.exec(url);
  if (m && (url.startsWith('/images/program-hero/clear-') || url.startsWith('/images/hero-courses/'))) {
    const portrait = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    const stem = `${m[1]}${portrait ? '-portrait' : ''}`;
    const widths = portrait ? [640, 960] : [640, 960, 1440, 1920];
    return { src: mediaUrl(`${stem}-960.webp`), srcSet: widths.map((w) => `${mediaUrl(`${stem}-${w}.webp`)} ${w}w`).join(', ') };
  }
  // Keep cached/older CMS records working; their original exports have no 640/1440 variants.
  if (m && url.startsWith('/images/program-hero/') && url.endsWith('-4k.webp')) {
    return { src: mediaUrl(`${m[1]}-1920.webp`), srcSet: `${mediaUrl(`${m[1]}-960.webp`)} 960w, ${mediaUrl(`${m[1]}-1920.webp`)} 1920w, ${mediaUrl(url)} 3840w` };
  }
  return { src: mediaUrl(u), srcSet: undefined };
};
const SIZES = '100vw';
const decodeImage = (url, priority = 'auto') => {
  const im = new Image();
  const r = srcs(url);
  const loaded = typeof im.decode === 'function' ? null : new Promise((resolve, reject) => {
    im.onload = resolve;
    im.onerror = () => reject(new Error('Hero image failed to load'));
  });
  im.fetchPriority = priority;
  im.decoding = 'async';
  im.sizes = SIZES;
  if (r.srcSet) im.srcset = r.srcSet;
  im.src = r.src;
  return loaded || im.decode();
};
const isCourse = (m) => m && m.courseId != null;
const secs = (d) => { const n = parseInt(String(d || ''), 10); return Number.isFinite(n) && n > 2 ? Math.min(n, 14) : 9; };

export function ProgramVideoHero({ section, fallbackTitle, fallbackBody }) {
  const { list } = useMedia();
  const reduce = useReducedMotion();
  const mobile = useMatch('(max-width: 767px)');
  const tab = useTabVisible();
  const [wrap, inView] = useInView();
  const hero = bySection(list, 'hero');
  const slides = hero.length ? hero : has(section?.image) ? [{ id: 'cover', name: section.name, type: 'image', url: section.image, altText: '' }] : [];
  const light = mobile || reduce || saveData();
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);
  const [imageError, setImageError] = useState('');
  const want = useRef(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;
  const nextUrl = slides.length ? slides[(idx + 1) % slides.length]?.url : '';
  const idxRef = useRef(0);
  idxRef.current = idx;
  const [playing, setPlaying] = useState(!reduce);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const { list: progs } = useVerified('programs');
  const { data: courses = [] } = usePublicList('courses');
  const vid = useRef(null);
  const n = slides.length;
  const cur = slides[idx % Math.max(n, 1)];
  const course = isCourse(cur) ? courses.find((c) => Number(c.id) === Number(cur.courseId)) : null;
  const courseSlug = course?.slug || cur?.courseSlug;
  const prog = cur && !isCourse(cur) ? progs.filter((p) => norm(p.name) === norm(cur.name) && (cur.universityId == null || p.universityId === cur.universityId)).sort((a, b) => rank(a) - rank(b) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.slug).localeCompare(String(b.slug)))[0] : null;
  const book = bookHref(isCourse(cur) ? { course: course?.name || cur.name } : prog ? { program: prog.name, university: prog.universityName } : cur?.universityId == null && cur?.name && cur.id !== 'cover' ? { program: cur.name } : {});
  const motionAllowed = playing && inView && tab && !hovering && !focused;
  const running = motionAllowed && n > 1;
  const show = useCallback((t) => {
    if (!n) return;
    const target = ((t % n) + n) % n;
    want.current = target;
    const s2 = slidesRef.current[target];
    const done = () => { if (want.current !== target) return; want.current = null; setImageError(''); setPrevIdx(idxRef.current === target ? null : idxRef.current); setIdx(target); };
    if (!s2 || s2.type === 'video' || target === idxRef.current) { done(); return; }
    decodeImage(s2.url).then(done).catch(() => {
      if (want.current !== target) return;
      want.current = null;
      setPlaying(false);
      setImageError("This image couldn't load. Please try another slide.");
    });
  }, [n]);
  const go = useCallback((d) => show(idxRef.current + d), [show]);
  useEffect(() => { if (prevIdx == null) return undefined; const t = setTimeout(() => setPrevIdx(null), 1000); return () => clearTimeout(t); }, [prevIdx]);
  useEffect(() => {
    if (n < 2 || !inView || !tab || saveData() || /(^|-)2g$/.test(navigator.connection?.effectiveType || '')) return undefined;
    const nx = slidesRef.current[(idx + 1) % n]; if (!nx || nx.type === 'video') return undefined;
    // Prefetch is opportunistic; actual selections report failures and retain the current image.
    const t = setTimeout(() => { decodeImage(nx.url, 'low').catch(() => {}); }, 1200);
    return () => clearTimeout(t);
  }, [idx, n, inView, tab, nextUrl]);
  useEffect(() => { if (reduce) setPlaying(false); }, [reduce]);
  useEffect(() => { if (!running) return undefined; const t = setTimeout(() => go(1), cur?.type === 'video' && !light ? secs(cur.duration) * 1000 : 6800); return () => clearTimeout(t); }, [running, idx, cur, light, go]);
  useEffect(() => { const v = vid.current; if (!v) return; if (motionAllowed) v.play?.().catch(() => {}); else v.pause?.(); }, [motionAllowed, idx]);
  const still = cur ? (cur.type === 'video' ? mediaUrl(cur.posterUrl || cur.thumbnailUrl) : mediaUrl(cur.url)) : '';
  const asVideo = cur?.type === 'video' && !light;
  const words = String(section?.name || fallbackTitle || '4PL Academy').split(/\s+/);
  return (
    <section ref={wrap} className="navy-surface on-navy relative min-h-[min(88svh,54rem)] overflow-hidden" aria-label="Featured programs and courses in motion" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="absolute inset-0 -z-10 bg-navy" aria-hidden="true">
        {prevIdx != null && slides[prevIdx] && slides[prevIdx].type !== 'video' && <div className="absolute inset-0"><img {...srcs(slides[prevIdx].url)} sizes={SIZES} alt="" className="h-full w-full object-cover object-[65%_center] sm:object-center" decoding="async" /></div>}
        {cur && (
          <motion.div key={`${cur.id}-${idx}`} className="absolute inset-0" initial={idx === 0 && prevIdx == null ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.8, ease: 'easeInOut' }}>
            {asVideo ? <video ref={vid} src={mediaUrl(cur.url)} poster={still || undefined} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
              : still ? <img {...(cur.type === 'video' ? { src: still } : srcs(cur.url))} sizes={SIZES} alt={cur.altText || ''} className={cn('h-full w-full object-cover object-[65%_center] sm:object-center', idx % 2 ? 'kb-b' : 'kb-a', !running && 'kb-paused')} fetchPriority={idx === 0 ? 'high' : undefined} loading="eager" decoding="async" /> : null}
          </motion.div>
        )}
        <div className="hero-image-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy/45 via-navy/10 to-transparent" />
      </div>
      <div className="container-x flex min-h-[min(88svh,54rem)] flex-col justify-center pb-10 pt-20">
        <div className="max-w-4xl">
          <motion.p key={cur?.id || 'brand'} initial={reduce || light ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-pill mb-4">{cur?.shortLabel || String(course?.name || cur?.name || '4PL Academy').replace(/^(?:BBA in |MBA \/ PGDM in |MBA \+ PGPM in |Foundation(?: Course)?(?: in| To)? )/i, '')}</motion.p>
          <h1 className="hero-title text-surface text-[clamp(1.9rem,10vw,4.5rem)] sm:text-7xl lg:text-[6rem]">
            {words.map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-visible align-bottom">
                <motion.span className={cn('inline-block', i === words.length - 1 && 'text-gold')} initial={reduce || light ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.09, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={reduce || light ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }} className="mt-4 max-w-xl text-base leading-relaxed text-surface/90 sm:text-lg">{section?.shortDescription || fallbackBody}</motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {(() => {
              const courseCatalog = isCourse(cur) && (!section?.ctaUrl || section.ctaUrl === '/programs');
              const a = { label: courseCatalog ? 'Explore Courses' : section?.ctaLabel || (section ? '' : 'Explore programs'), url: courseCatalog ? '/professional-courses' : section?.ctaUrl || '/programs', testid: 'link-hero-programs' };
              const b = { label: section?.secondaryCtaLabel || (section ? '' : 'Book Counselling'), url: section?.secondaryCtaUrl || '/book-counselling', testid: 'button-hero-bot' };
              const isBook = (x) => /counsel|book/i.test(`${x.label} ${x.url}`);
              const bookB = isBook(b) || !isBook(a);
              const [first, second] = bookB ? [b, a] : [a, b];
              return <><Cta {...first} url={isBook(first) && first.url !== 'bot' ? book : first.url} className="btn-hero" /><Cta {...second} url={isBook(second) && second.url !== 'bot' ? book : second.url} variant="light" className="btn-hero" /></>;
            })()}
          </motion.div>
        </div>
        {n > 0 && (
          <div className="mt-8 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 text-sm text-surface/85" aria-live={running ? 'off' : 'polite'}>
                <span className="text-xs font-bold uppercase tracking-wider text-gold">{String(idx % n + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
                <AnimatePresence mode="wait" initial={false}><motion.span key={cur?.id} className="ml-2 inline-block font-bold text-surface" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>{cur?.name}</motion.span></AnimatePresence>
                {!isCourse(cur) && prog && has(prog.universityName) && <span className="ml-2 text-xs text-surface/60">{prog.universityName}</span>}
                {isCourse(cur) ? courseSlug && <Link href={`/professional-courses/${courseSlug}`} className="ml-3 inline-flex items-center gap-1 text-xs font-bold text-gold underline underline-offset-2">Course details<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link> : prog?.slug && <Link href={`/programs/${prog.slug}`} className="ml-3 inline-flex items-center gap-1 text-xs font-bold text-gold underline underline-offset-2">Program details<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
              </div>
            </div>
            {n > 1 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Choose a program or course visual">
                {slides.map((m, i) => (
                  <li key={m.id}><button type="button" onClick={() => { setPlaying(false); show(i); }} aria-current={i === idx % n} aria-label={m.name} title={m.name} className="grid h-8 w-8 place-items-center"><span className={cn('block h-1 rounded-full transition-all duration-500', i === idx % n ? 'w-8 bg-gold' : 'w-4 bg-surface/40')} /></button></li>
                ))}
              </ul>
            )}
            {imageError && <p role="status" className="mt-2 text-sm text-surface">{imageError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
