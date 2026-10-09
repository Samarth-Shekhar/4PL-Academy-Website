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
import { focusPrograms } from '@/lib/program-focus';

const norm = (x) => String(x || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const rank = (p) => (/sushant/i.test(p.universityName || '') ? 0 : 1);
const srcs = (u) => {
  const url = String(u || '');
  const focus = /^(\/images\/edtech\/[a-z-]+)-(?:640|960|1440)\.webp$/.exec(url);
  if (focus) {
    return { src: mediaUrl(`${focus[1]}-960.webp`), srcSet: [640, 960, 1440].map((w) => `${mediaUrl(`${focus[1]}-${w}.webp`)} ${w}w`).join(', ') };
  }
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
const SIZES = '(min-width: 1024px) 48vw, 100vw';
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
  const { list: progs } = useVerified('programs');
  const curated = focusPrograms(progs).map((p) => ({
    id: `focus-${p.id}`, type: 'image', name: p.name, programSlug: p.slug,
    universityId: p.universityId, url: p.focus.heroImage,
    shortLabel: p.specialization || p.degree, altText: p.focus.alt,
  }));
  const hero = bySection(list, 'hero');
  const slides = curated.length ? curated : hero.length ? hero : has(section?.image) ? [{ id: 'cover', name: section.name, type: 'image', url: section.image, altText: '' }] : [];
  const light = mobile || reduce || saveData();
  const [idx, setIdx] = useState(0);
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
  const panRunning = playing && inView && tab && !reduce && !saveData();
  const show = useCallback((t) => {
    if (!n) return;
    const target = ((t % n) + n) % n;
    want.current = target;
    const s2 = slidesRef.current[target];
    const done = () => { if (want.current !== target) return; want.current = null; setImageError(''); setIdx(target); };
    if (!s2 || s2.type === 'video' || target === idxRef.current) { done(); return; }
    decodeImage(s2.url).then(done).catch(() => {
      if (want.current !== target) return;
      want.current = null;
      setPlaying(false);
      setImageError("This image couldn't load. Please try another slide.");
    });
  }, [n]);
  const go = useCallback((d) => show(idxRef.current + d), [show]);
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
    <section ref={wrap} className="relative isolate overflow-hidden bg-white text-navy" aria-label="Featured programs and courses in motion" data-testid="section-home-hero" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={(event) => { if (event.target.closest('a, button')) setFocused(true); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="container-x relative grid gap-8 pb-12 pt-10 sm:gap-12 sm:py-16 lg:min-h-[42rem] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
      <div className="relative order-2 min-h-[19rem] overflow-hidden rounded-[2rem] bg-navy sm:min-h-[26rem] lg:h-[34rem]" data-testid="hero-photo">
        <AnimatePresence initial={false} mode="sync">
        {cur && (
          <motion.div key={`${cur.id}-${idx}`} data-testid="hero-image-layer" className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}>
            {asVideo ? <video ref={vid} src={mediaUrl(cur.url)} poster={still || undefined} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
              : still ? <img {...(cur.type === 'video' ? { src: still } : srcs(cur.url))} sizes={SIZES} alt={cur.altText || ''} className={cn('h-full w-full object-cover object-[65%_center] sm:object-center motion-reduce:animate-none motion-reduce:transform-none', !reduce && !saveData() && (idx % 2 ? 'kb-b' : 'kb-a'), !panRunning && 'kb-paused')} fetchPriority={idx === 0 ? 'high' : undefined} loading="eager" decoding="async" /> : null}
          </motion.div>
        )}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy/75 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Explore your next chapter</p><p className="mt-2 max-w-[22rem] font-display text-xl font-bold sm:text-2xl">{cur?.name}</p></div>
          {prog?.slug && <Link href={`/programs/${prog.slug}`} aria-label={`Explore ${prog.name}`} data-testid="link-hero-image-program" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-navy transition hover:bg-white"><ArrowUpRight className="h-6 w-6" /></Link>}
        </div>
      </div>
      <div className="order-1 flex min-w-0 flex-col justify-center">
        <div className="max-w-4xl">
          <motion.p key={cur?.id || 'brand'} initial={reduce || light ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-gold/35 bg-gold-soft px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-navy"><span className="h-2 w-2 shrink-0 rounded-full bg-gold" />{cur?.shortLabel || 'Education for your next chapter'}</motion.p>
          <h1 style={{ textShadow: 'none' }} className="hero-title text-navy text-[clamp(2.2rem,6.5vw,4.8rem)] font-extrabold leading-[1.06]">
            {words.map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-visible align-bottom">
                <motion.span className={cn('inline-block', i === words.length - 1 && 'text-gold')} initial={reduce || light ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.09, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={reduce || light ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }} className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{section?.shortDescription || fallbackBody}</motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {(() => {
              const courseCatalog = isCourse(cur) && (!section?.ctaUrl || section.ctaUrl === '/programs');
              const a = { label: courseCatalog ? 'Explore Courses' : section?.ctaLabel || (section ? '' : 'Explore programs'), url: courseCatalog ? '/professional-courses' : section?.ctaUrl || '/programs', testid: 'link-hero-programs' };
              const b = { label: section?.secondaryCtaLabel || (section ? '' : 'Book Counselling'), url: section?.secondaryCtaUrl || '/book-counselling', testid: 'button-hero-bot' };
              const isBook = (x) => /counsel|book/i.test(`${x.label} ${x.url}`);
              const [first, second] = isBook(a) ? [b, a] : [a, b];
              return <><Cta {...first} url={isBook(first) && first.url !== 'bot' ? book : first.url} className="btn-hero" variant="gold" /><Cta {...second} url={isBook(second) && second.url !== 'bot' ? book : second.url} variant="outline" className="btn-hero" /></>;
            })()}
          </motion.div>
        </div>
        {n > 0 && (
          <div className="mt-8 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 text-sm text-navy" aria-live={running ? 'off' : 'polite'}>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-deep">{String(idx % n + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
                <span className="ml-2 inline-block font-bold">{cur?.name}</span>
                {!isCourse(cur) && prog && has(prog.universityName) && <span className="ml-2 text-xs text-muted-foreground">{prog.universityName}</span>}
                {isCourse(cur) ? courseSlug && <Link href={`/professional-courses/${courseSlug}`} className="ml-3 mt-2 inline-flex items-center gap-1 text-xs font-bold text-gold-deep underline underline-offset-2">Course details<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link> : prog?.slug && <Link href={`/programs/${prog.slug}`} data-testid="link-hero-program-details" className="ml-3 mt-2 inline-flex items-center gap-1 text-xs font-bold text-gold-deep underline underline-offset-2">Program details<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
              </div>
            </div>
            {n > 1 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Choose a program or course visual">
                {slides.map((m, i) => (
                  <li key={m.id}><button type="button" data-testid={`button-hero-slide-${i}`} onClick={() => { setPlaying(false); show(i); }} aria-current={i === idx % n} aria-label={m.name} title={m.name} className="grid h-8 w-8 place-items-center rounded-full focus-visible:outline focus-visible:outline-gold"><span className={cn('block h-1 rounded-full transition-all duration-500', i === idx % n ? 'w-8 bg-gold' : 'w-4 bg-navy/20')} /></button></li>
                ))}
              </ul>
            )}
            {imageError && <p role="status" className="mt-2 text-sm text-navy">{imageError}</p>}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
