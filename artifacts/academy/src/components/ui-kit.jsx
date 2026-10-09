import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { routeHeroImage } from '@/lib/route-images';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Breadcrumbs } from './Breadcrumbs';

export function Reveal({ children, delay = 0, className, y = 22, as = 'div' }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  );
}
export const Skeleton = ({ className }) => <div className={cn('skel', className)} aria-hidden="true" />;
export function CardSkeletons({ n = 6, className = 'h-72' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => <Skeleton key={i} className={className} />)}
    </div>
  );
}
export function ErrorState({ onRetry, title = 'We could not load this right now', body = 'Please check your connection and try again.' }) {
  return (
    <div className="card-s p-8 text-center" role="alert">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-gold-deep" aria-hidden="true" />
      <h3 className="text-xl text-navy">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn btn-navy mt-5"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again</button>}
    </div>
  );
}
export function EmptyState({ title, body, action, icon: Icon = Inbox }) {
  return (
    <div className="rounded-lg border border-dashed border-navy/25 bg-mist/50 p-8 text-center sm:p-12">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold-deep"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <h3 className="text-xl text-navy">{title}</h3>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
export function SectionHead({ eyebrow, title, body, light, align = 'left', children }) {
  return (
    <div className={cn('mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', align === 'center' && 'items-center text-center sm:flex-col sm:items-center')}>
      <div className="max-w-2xl">
        {eyebrow && <p className={cn('eyebrow mb-3', light && 'eyebrow-light')}>{eyebrow}</p>}
        <h2 className={cn('text-3xl font-extrabold leading-[1.05] sm:text-4xl lg:text-5xl', light ? 'text-surface' : 'text-navy')}>{title}</h2><div className="gold-rule mt-4" />
        {body && <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', light ? 'text-surface/75' : 'text-muted-foreground')}>{body}</p>}
      </div>
      {children}
    </div>
  );
}
export function PageHero({ eyebrow, title, body, crumbs, children, image }) {
  const [loc] = useLocation();
  const reduce = useReducedMotion();
  const src = image || routeHeroImage(loc);
  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'preload'; l.as = 'image'; l.href = src;
    document.head.appendChild(l);
    return () => { l.remove(); };
  }, [src]);
  return (
    <header className="edu-hero relative isolate overflow-hidden">
      <div aria-hidden="true" className="edu-hero-blob pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full" />
      <div className="container-x relative grid items-center gap-8 pb-10 pt-5 sm:pb-16 sm:pt-7 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
        <div className="min-w-0">
          {crumbs && <Breadcrumbs items={crumbs} />}
          <motion.div className="mt-6 sm:mt-10" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            <h1 className="break-words text-[2.1rem] font-extrabold leading-[1.02] text-navy sm:text-5xl lg:text-[3.6rem]">{title}</h1>
            <div className="gold-rule mt-5" />
            {body && <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">{body}</p>}
            {children}
          </motion.div>
        </div>
        <motion.div className="edu-hero-frame relative order-first aspect-[16/8] w-full lg:order-none lg:aspect-[4/4.2]" initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <img src={src} alt="" aria-hidden="true" loading="eager" decoding="async" fetchPriority="high" draggable={false} className="h-full w-full select-none rounded-[1.75rem] object-cover" />
        </motion.div>
      </div>
    </header>
  );
}
export const VerifyChip = ({ ok, label }) => (
  <span className={cn('chip', ok ? 'chip-ok' : 'chip-warn')}>{label}</span>
);
export const Fact = ({ icon: Icon, label, value }) => (value === '' || value === null || value === undefined || value === false) ? null : (
  <div className="flex items-start gap-2.5 min-w-0">
    {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />}
    <div className="min-w-0">
      <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-semibold text-navy">{value}</p>
    </div>
  </div>
);

export function SplitHero({ image, alt = '', eyebrow, title, body, actions, logo }) {
  const reduce = useReducedMotion();
  return (
    <section className="edu-hero relative isolate overflow-hidden">
      <div aria-hidden="true" className="edu-hero-blob pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full" />
      <div className="container-x grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-14 lg:py-20">
        <motion.div className="min-w-0" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          {logo}
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="display-lg max-w-3xl break-words text-navy">{title}</h1>
          <div className="gold-rule mt-5" />
          {body && <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">{body}</p>}
          {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>}
        </motion.div>
        {image && <div className="edu-hero-frame relative order-first aspect-[16/9] w-full lg:order-none lg:aspect-[4/4.2]"><img src={image} alt={alt} fetchPriority="high" decoding="async" className="h-full w-full rounded-[1.75rem] object-cover" /></div>}
      </div>
    </section>
  );
}
