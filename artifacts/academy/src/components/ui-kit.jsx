import { motion, useReducedMotion } from 'framer-motion';
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
        <h2 className={cn('text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl', light ? 'text-surface' : 'text-navy')}>{title}</h2>
        {body && <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', light ? 'text-surface/75' : 'text-muted-foreground')}>{body}</p>}
      </div>
      {children}
    </div>
  );
}
export function PageHero({ eyebrow, title, body, crumbs, children }) {
  return (
    <header className="px-3 pt-3 sm:px-5">
      <div className="page-hero navy-surface on-navy relative overflow-hidden rounded-[1.75rem]">
        <div className="container-x relative pb-10 pt-6 sm:pb-16 sm:pt-8">
          {crumbs && <Breadcrumbs items={crumbs} light />}
          <div className="mt-8 max-w-3xl">
            {eyebrow && <p className="hero-pill mb-4">{eyebrow}</p>}
            <h1 className="text-[2rem] font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
            {body && <p className="mt-4 max-w-2xl text-base leading-relaxed text-surface/80 sm:text-lg">{body}</p>}
            {children}
          </div>
        </div>
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
