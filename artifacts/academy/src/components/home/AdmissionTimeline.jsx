import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { has } from '@/lib/format';
import { useMatch } from '@/lib/home';
import { Head, Body, Cta, Pic } from './shared';
import { safeHref } from './MovingCards';
import './admission-carousel.css';

function Step({ it, i, duplicate = false }) {
  const href = safeHref(it.url, '/apply');
  const ext = /^https?:/i.test(href);
  const cls = 'admission-card group flex flex-col overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';
  const inner = <>
    <div className="aspect-[16/11] shrink-0 overflow-hidden"><Pic src={it.image} alt={it.altText || ''} label={it.name} className="admission-card-image h-full w-full" /></div>
    <div className="flex flex-1 flex-col p-5">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-sm font-bold text-gold" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <h3 className="mt-2 text-lg font-bold leading-snug text-navy">{it.name}</h3>
      {has(it.description) && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{it.description}</p>}
      <span className="mt-auto pt-3 text-sm font-bold text-navy underline underline-offset-4">Go</span>
    </div>
  </>;
  const props = {
    className: cls,
    'aria-label': `Step ${String(i + 1).padStart(2, '0')}: ${it.name}`,
    'data-testid': `admission-step-${i + 1}`,
    ...(duplicate ? { tabIndex: -1, 'aria-hidden': true } : {}),
  };
  return ext ? <a {...props} href={href} target="_blank" rel="noopener noreferrer">{inner}</a> : <Link {...props} href={href}>{inner}</Link>;
}

export function AdmissionTimeline({ s }) {
  const items = s.items || [];
  const viewport = useRef(null);
  const track = useRef(null);
  const interaction = useRef({ hover: false, focus: false, touch: false, dragging: false, moved: false, startX: 0, startScroll: 0, manualUntil: 0, userPaused: false });
  const dragClick = useRef(false);
  const reduce = useMatch('(prefers-reduced-motion: reduce)');
  const [copies, setCopies] = useState(3);
  const loopOffset = useRef(0);

  useEffect(() => {
    const node = viewport.current;
    const rail = track.current;
    if (!node || !rail || items.length < 2) return undefined;
    if (reduce) {
      node.scrollLeft = Math.min(loopOffset.current, Math.max(0, node.scrollWidth - node.clientWidth));
      return undefined;
    }
    let raf = 0;
    let previous = 0;
    let loopWidth = 0;
    let position = node.scrollLeft;
    let visible = false;
    let initialized = false;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) node.parentElement.classList.add('is-visible');
    });
    visibility.observe(node);
    const measure = () => {
      const firstCard = rail.querySelector('[data-admission-card]');
      const duplicate = rail.querySelector('[data-admission-copy="1"]');
      loopWidth = duplicate && firstCard ? duplicate.offsetLeft - firstCard.offsetLeft : rail.scrollWidth / 3;
      if (loopWidth > 0) setCopies(Math.max(3, Math.ceil(node.clientWidth / loopWidth) + 2));
      if (loopWidth > 0 && !initialized) {
        node.scrollLeft = loopWidth + loopOffset.current % loopWidth;
        position = node.scrollLeft;
        initialized = true;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(rail);
    const tick = (time) => {
      const dt = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      const h = interaction.current;
      if (Math.abs(node.scrollLeft - position) > 1.5) position = node.scrollLeft;
      if (visible && !document.hidden && !reduce && !(h.hover || h.focus || h.touch || h.dragging || h.userPaused) && time > h.manualUntil && loopWidth > 0) {
        position += dt * 0.014;
        node.scrollLeft = position;
      } else position = node.scrollLeft;
      if (loopWidth > 0) {
        if (node.scrollLeft >= loopWidth * 2) { node.scrollLeft -= loopWidth; position = node.scrollLeft; }
        else if (node.scrollLeft < loopWidth * 0.15) { node.scrollLeft += loopWidth; position = node.scrollLeft; }
        loopOffset.current = node.scrollLeft % loopWidth;
      }
      if (visible && !reduce) updateCurve(node);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); visibility.disconnect(); };
  }, [items.length, reduce]);

  const updateCurve = (node) => {
    const center = node.getBoundingClientRect().left + node.clientWidth / 2;
    const measured = [...node.querySelectorAll('[data-admission-card]')].map((card) => {
      const rect = card.getBoundingClientRect();
      const delta = (rect.left + rect.width / 2 - center) / Math.max(node.clientWidth / 2, 1);
      const bounded = Math.max(-1.35, Math.min(1.35, delta));
      return { card, bounded };
    });
    measured.forEach(({ card, bounded }) => {
      card.style.setProperty('--curve-angle', `${bounded * -10}deg`);
      card.style.setProperty('--curve-depth', `${-Math.min(72, Math.abs(bounded) * 58)}px`);
      card.style.setProperty('--curve-scale', `${1 - Math.min(.1, Math.abs(bounded) * .07)}`);
    });
  };

  const moveBy = (direction) => {
    const node = viewport.current;
    const first = node?.querySelector('[data-admission-card]');
    if (node && first) {
      interaction.current.manualUntil = performance.now() + 1800;
      node.scrollBy({ left: direction * (first.offsetWidth + 28), behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const handlePointerDown = (event) => {
    dragClick.current = false;
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      interaction.current.touch = true;
      return;
    }
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const state = interaction.current;
    state.dragging = true;
    state.moved = false;
    state.startX = event.clientX;
    state.startScroll = viewport.current.scrollLeft;
    viewport.current.classList.add('is-dragging');
  };
  const handlePointerMove = (event) => {
    const state = interaction.current;
    if (!state.dragging) return;
    const distance = event.clientX - state.startX;
    if (Math.abs(distance) > 5 && !state.moved) {
      state.moved = true;
      viewport.current.setPointerCapture(event.pointerId);
    }
    if (state.moved) viewport.current.scrollLeft = state.startScroll - distance;
  };
  const handlePointerUp = () => {
    const state = interaction.current;
    if (state.touch) {
      state.touch = false;
      state.manualUntil = performance.now() + 1800;
    }
    if (!state.dragging) return;
    state.dragging = false;
    viewport.current?.classList.remove('is-dragging');
    if (state.moved) {
      state.manualUntil = performance.now() + 1800;
      dragClick.current = true;
      const cards = [...(viewport.current?.querySelectorAll('[data-admission-card]') || [])];
      const center = viewport.current.getBoundingClientRect().left + viewport.current.clientWidth / 2;
      const nearest = cards.reduce((best, card) => Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center) < Math.abs(best.getBoundingClientRect().left + best.offsetWidth / 2 - center) ? card : best, cards[0]);
      if (nearest) viewport.current.scrollBy({ left: nearest.getBoundingClientRect().left + nearest.offsetWidth / 2 - center, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const displayItems = !reduce && items.length > 1 ? Array.from({ length: copies }, () => items).flat() : items;
  return (
    <section className="admissions-section bg-mist/70 py-16 sm:py-24" aria-labelledby="sec-admissions">
      <div className="container-x flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div id="sec-admissions"><Head s={s} /><Body s={s} /></div><div className="flex flex-col gap-3 sm:flex-row"><Cta label={s.ctaLabel} url={s.ctaUrl} variant="navy" testid={`cta-${s.slug}-primary`} />{s.secondaryCtaLabel !== s.ctaLabel && <Cta label={s.secondaryCtaLabel} url={s.secondaryCtaUrl} variant="outline" testid={`cta-${s.slug}-secondary`} />}</div></div>
      {items.length > 0 && <div className="admissions-carousel mt-8 sm:mt-10">
        <div
          ref={viewport}
          role="region"
          aria-roledescription="carousel"
          aria-label="Admission steps"
          tabIndex={0}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') { interaction.current.hover = true; } }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') { interaction.current.hover = false } }}
          onFocus={() => { interaction.current.focus = true; }}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { interaction.current.focus = false } }}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); moveBy(e.key === 'ArrowLeft' ? -1 : 1); } }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => { if (dragClick.current && e.detail > 0) { dragClick.current = false; e.preventDefault(); e.stopPropagation(); } }}
          className="admissions-viewport no-scrollbar"
          data-testid="admissions-carousel"
        >
          <div className="admissions-track" ref={track}>
            {displayItems.map((it, index) => {
              const group = Math.floor(index / items.length);
              const i = index % items.length;
              return <div className="admission-card-shell" key={`${group}-${i}`} data-admission-card data-admission-copy={group}>
                <Step it={it} i={i} duplicate={!reduce && items.length > 1 && group !== 1} />
              </div>;
            })}
          </div>
        </div>
      </div>}
    </section>
  );
}
