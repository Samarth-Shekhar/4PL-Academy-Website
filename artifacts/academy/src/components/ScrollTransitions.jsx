import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Native scrolling remains native; entrance effects never hide content.
export function ScrollTransitions() {
  const [location] = useLocation();
  useEffect(() => {
    const main = document.querySelector('#main');
    if (!main || !window.IntersectionObserver) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet();
    const animations = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        if (preference.matches || !target.animate || target.closest('[data-no-reveal]')) continue;
        // Framer Motion already owns some sections. Only animate editorial
        // headings and figures, never interactive forms or whole tall pages.
        const animation = target.animate(
          [{ opacity: .35, translate: '0 14px' }, { opacity: 1, translate: '0 0' }],
          { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
    const scan = () => main.querySelectorAll('h1,h2,figure,[data-testid^="card-blog-"]').forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      observer.observe(element);
    });
    scan();
    // Catalog sections arrive asynchronously after navigation.
    const mutations = new MutationObserver(scan);
    mutations.observe(main, { childList: true, subtree: true });
    const stop = () => { if (preference.matches) animations.forEach(a => a.cancel()); };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach(a => a.cancel());
      preference.removeEventListener('change', stop);
    };
  }, [location]);
  return null;
}
