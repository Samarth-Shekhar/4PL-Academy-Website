// Adapted from React Bits by David Haz: https://reactbits.dev/text-animations/blur-text
// MIT + Commons Clause; see LICENSE.md. Adaptations: framer-motion, semantic tag,
// reduced-motion fallback and one-shot intersection observation.
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const frames = {};
  keys.forEach(k => { frames[k] = [from[k], ...steps.map(s => s[k])]; });
  return frames;
};

export default function BlurText({
  text = '', delay = 65, className = '', animateBy = 'words', direction = 'bottom',
  threshold = 0.1, rootMargin = '0px', animationFrom, animationTo,
  easing = 'easeOut', onAnimationComplete, stepDuration = 0.2, as: Tag = 'p',
}) {
  const reduced = useReducedMotion();
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || reduced) return undefined;
    if (!('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold, rootMargin });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reduced]);

  const defaultFrom = useMemo(() => ({
    filter: 'blur(6px)', opacity: 0, y: direction === 'top' ? -20 : 20,
  }), [direction]);
  const defaultTo = useMemo(() => [
    { filter: 'blur(3px)', opacity: 0.5, y: direction === 'top' ? 3 : -3 },
    { filter: 'blur(0px)', opacity: 1, y: 0 },
  ], [direction]);
  const from = animationFrom ?? defaultFrom;
  const to = animationTo ?? defaultTo;
  const count = to.length + 1;
  const times = Array.from({ length: count }, (_, i) => count === 1 ? 0 : i / (count - 1));
  return (
    <Tag ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }} aria-label={text}>
      {elements.map((segment, i) => (
        <motion.span key={i} className="inline-block" aria-hidden="true"
          initial={reduced ? false : from}
          animate={reduced ? { filter: 'none', opacity: 1, y: 0 } : inView ? buildKeyframes(from, to) : from}
          transition={reduced ? { duration: 0 } : { duration: stepDuration * (count - 1), times, delay: i * delay / 1000, ease: easing }}
          onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}>
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && i < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </Tag>
  );
}
