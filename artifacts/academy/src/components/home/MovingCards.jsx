import { useEffect, useRef, useState } from 'react';
import { useMatch } from '@/lib/home';
import { cn } from '@/lib/cn';

/* Seamless auto-scrolling card row. Native scroll container so touch, wheel,
   keyboard and drag all work; pauses on hover, focus and touch. */
export function MovingCards({ items, render, label, speed = 40, className }) {
  const reduce = useMatch('(prefers-reduced-motion: reduce)');
  const el = useRef(null);
  const first = useRef(null);
  const hold = useRef({ hover: false, focus: false, touch: false });
  const touchTimer = useRef(0);
  const [copies, setCopies] = useState(1);
  const canLoop = !reduce && items.length > 0;

  useEffect(() => {
    const n = el.current; const g = first.current;
    if (!n || !g || !canLoop) { setCopies(1); return undefined; }
    let raf = 0; let last = 0; let pos = n.scrollLeft; let period = 0;
    const measure = () => {
      const second = n.querySelector('[data-mc-group="1"]');
      period = second ? second.offsetLeft - g.offsetLeft : g.offsetWidth + 20;
      if (!second) period = g.offsetWidth + 20;
      if (period > 0) setCopies(Math.max(2, Math.ceil(n.clientWidth / period) + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(n); ro.observe(g);
    const tick = (t) => {
      const dt = last ? Math.min(t - last, 64) : 0; last = t;
      if (Math.abs(n.scrollLeft - pos) > 1.5) pos = n.scrollLeft;
      const h = hold.current;
      if (!(h.hover || h.focus || h.touch) && period > 0) {
        pos += (speed * dt) / 1000;
        n.scrollLeft = pos;
      } else pos = n.scrollLeft;
      if (period > 0 && n.scrollLeft >= period) { n.scrollLeft -= period; pos = n.scrollLeft; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [canLoop, items.length, speed]);

  // duplicate groups: out of tab order and hidden from assistive tech, still pointer-clickable
  useEffect(() => {
    el.current?.querySelectorAll('[data-mc-dup] a, [data-mc-dup] button').forEach((x) => x.setAttribute('tabindex', '-1'));
  });

  const set = (k, v) => { hold.current[k] = v; };
  const n = canLoop ? copies : 1;
  return (
    <div
      ref={el}
      role="region"
      aria-label={label}
      tabIndex={0}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') set('hover', true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') set('hover', false); }}
      onFocus={() => set('focus', true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) set('focus', false); }}
      onTouchStart={() => { clearTimeout(touchTimer.current); set('touch', true); }}
      onTouchEnd={() => { touchTimer.current = setTimeout(() => set('touch', false), 2500); }}
      className={cn('moving-cards flex items-stretch gap-5 overflow-x-auto px-4 py-8 sm:px-6', className)}
    >
      {Array.from({ length: n }, (_, c) => (
        <div key={c} ref={c === 0 ? first : undefined} data-mc-group={c} className="flex shrink-0 items-stretch gap-5" {...(c > 0 ? { 'aria-hidden': 'true', 'data-mc-dup': '' } : {})}>
          {items.map((it, i) => <div key={i} className="mc-item shrink-0">{render(it, i)}</div>)}
        </div>
      ))}
    </div>
  );
}

export const safeHref = (url, fallback) => {
  const u = String(url || '').trim();
  return u && u.toLowerCase() !== 'bot' && (u.startsWith('/') || /^https?:/i.test(u)) ? u : fallback;
};
