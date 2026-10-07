import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { has } from '@/lib/format';
import { useMatch } from '@/lib/home';
import { Head, Body, CtaRow, Pic } from './shared';
import { safeHref } from './MovingCards';
import './admission-carousel.css';

function Step({ it, i, duplicate = false }) {
  const href = safeHref(it.url, '/apply');
  const ext = /^https?:/i.test(href);
  const cls = 'admission-card group block w-[min(72vw,17rem)] shrink-0 overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:w-[18rem]';
  const inner = <><Pic src={it.image} alt={it.altText || ''} label={it.name} className="admission-card-image h-full w-full" /><span className="sr-only">{it.name}{has(it.description) ? `: ${it.description}` : ''}</span></>;
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
  const interaction = useRef({ hover: false, focus: false, touch: false, dragging: false, moved: false, startX: 0, startScroll: 0 });
  const dragClick = useRef(false);
  const reduce = useMatch('(prefers-reduced-motion: reduce)');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = viewport.current;
    const rail = track.current;
    if (!node || !rail || items.length < 2) return undefined;
    let raf = 0;
    let previous = 0;
    let loopWidth = 0;
    let lastMeasure = 0;
    const measure = () => {
      const firstCard = rail.querySelector('[data-admission-card]');
      const duplicate = rail.querySelector('[data-admission-copy="1"]');
      loopWidth = duplicate && firstCard ? duplicate.offsetLeft - firstCard.offsetLeft : rail.scrollWidth / 3;
      if (loopWidth > 0 && node.scrollLeft < 1) node.scrollLeft = loopWidth;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(rail);
    const tick = (time) => {
      if (time - lastMeasure > 400) { measure(); lastMeasure = time; }
      const dt = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      const h = interaction.current;
      if (!reduce && !(h.hover || h.focus || h.touch || h.dragging) && loopWidth > 0) node.scrollLeft += dt * 0.027;
      if (loopWidth > 0) {
        if (node.scrollLeft >= loopWidth * 2) node.scrollLeft -= loopWidth;
        else if (node.scrollLeft < loopWidth * 0.15) node.scrollLeft += loopWidth;
      }
      updateCurve(node);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [items.length, reduce]);

  const updateCurve = (node) => {
    const center = node.getBoundingClientRect().left + node.clientWidth / 2;
    node.querySelectorAll('[data-admission-card]').forEach((card) => {
      const rect = card.getBoundingClientRect();
      const delta = (rect.left + rect.width / 2 - center) / Math.max(node.clientWidth / 2, 1);
      const bounded = Math.max(-1.35, Math.min(1.35, delta));
      card.style.setProperty('--curve-angle', `${bounded * -10}deg`);
      card.style.setProperty('--curve-depth', `${-Math.min(72, Math.abs(bounded) * 58)}px`);
      card.style.setProperty('--curve-scale', `${1 - Math.min(.1, Math.abs(bounded) * .07)}`);
    });
  };

  const moveBy = (direction) => {
    const node = viewport.current;
    const first = node?.querySelector('[data-admission-card]');
    if (node && first) node.scrollBy({ left: direction * (first.getBoundingClientRect().width + 20), behavior: reduce ? 'auto' : 'smooth' });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      interaction.current.touch = true;
      setPaused(true);
      return;
    }
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const state = interaction.current;
    state.dragging = true;
    state.moved = false;
    state.startX = event.clientX;
    state.startScroll = viewport.current.scrollLeft;
    viewport.current.classList.add('is-dragging');
    viewport.current.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event) => {
    const state = interaction.current;
    if (!state.dragging) return;
    const distance = event.clientX - state.startX;
    if (Math.abs(distance) > 5) state.moved = true;
    if (state.moved) viewport.current.scrollLeft = state.startScroll - distance;
  };
  const handlePointerUp = () => {
    const state = interaction.current;
    if (state.touch) {
      state.touch = false;
      setPaused(state.hover || state.focus);
    }
    if (!state.dragging) return;
    state.dragging = false;
    viewport.current?.classList.remove('is-dragging');
    if (state.moved) {
      dragClick.current = true;
      window.setTimeout(() => { dragClick.current = false; }, 0);
      const cards = [...(viewport.current?.querySelectorAll('[data-admission-card]') || [])];
      const center = viewport.current.getBoundingClientRect().left + viewport.current.clientWidth / 2;
      const nearest = cards.reduce((best, card) => Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center) < Math.abs(best.getBoundingClientRect().left + best.offsetWidth / 2 - center) ? card : best, cards[0]);
      nearest?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const displayItems = items.length > 1 ? [...items, ...items, ...items] : items;
  return (
    <section className="admissions-section bg-mist/70 py-16 sm:py-24" aria-labelledby="sec-admissions">
      <div className="container-x flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div id="sec-admissions"><Head s={s} /><Body s={s} /></div><CtaRow s={s} /></div>
      {items.length > 0 && <div className="admissions-carousel mt-8 sm:mt-10">
        <div
          ref={viewport}
          role="region"
          aria-roledescription="carousel"
          aria-label="Admission steps"
          tabIndex={0}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') { interaction.current.hover = true; setPaused(true); } }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') { interaction.current.hover = false; setPaused(interaction.current.focus); } }}
          onFocus={() => { interaction.current.focus = true; setPaused(true); }}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { interaction.current.focus = false; setPaused(interaction.current.hover); } }}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); moveBy(e.key === 'ArrowLeft' ? -1 : 1); } }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={(e) => { if (dragClick.current) { e.preventDefault(); e.stopPropagation(); } }}
          className="admissions-viewport no-scrollbar"
          data-testid="admissions-carousel"
        >
          <div className="admissions-track" ref={track}>
            {displayItems.map((it, index) => {
              const group = Math.floor(index / items.length);
              const i = index % items.length;
              return <div className="admission-card-shell" key={`${group}-${i}`} data-admission-card data-admission-copy={group}>
                <Step it={it} i={i} duplicate={group !== 1} />
              </div>;
            })}
          </div>
        </div>
        <div className="container-x admissions-controls" aria-label="Carousel controls">
          <span className="admissions-hint" aria-live="polite">{paused ? 'Paused' : 'Explore each step'}</span>
          <div className="flex gap-2">
            <button type="button" className="admissions-arrow" aria-label="Previous admission step" data-testid="button-admission-previous" onClick={() => moveBy(-1)}><ArrowLeft aria-hidden="true" /></button>
            <button type="button" className="admissions-arrow" aria-label="Next admission step" data-testid="button-admission-next" onClick={() => moveBy(1)}><ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </div>}
    </section>
  );
}
