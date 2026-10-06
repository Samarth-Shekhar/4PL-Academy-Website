import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { animate, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bot } from 'lucide-react';
import { openBot } from '@/lib/events';
import { has, initials } from '@/lib/format';
import { mediaUrl, useInView } from '@/lib/home';
import { cn } from '@/lib/cn';

export function Cta({ label, url, variant = 'gold', className, testid }) {
  if (!has(label) || !has(url)) return null;
  const cls = cn('btn', `btn-${variant}`, className);
  const u = String(url).trim();
  if (u.toLowerCase() === 'bot') return <button type="button" className={cls} onClick={() => openBot()} data-testid={testid}><Bot className="h-4 w-4" aria-hidden="true" />{label}</button>;
  if (/^https?:/i.test(u)) return <a href={u} className={cls} target="_blank" rel="noopener noreferrer" data-testid={testid}>{label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;
  return <Link href={u} className={cls} data-testid={testid}>{label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>;
}
export function CtaRow({ s, light, className }) {
  if (!s) return null;
  const sec = light ? 'light' : 'outline';
  if (!has(s.ctaLabel) && !has(s.secondaryCtaLabel)) return null;
  return <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', className)}><Cta label={s.ctaLabel} url={s.ctaUrl} variant={light ? 'gold' : 'navy'} testid={`cta-${s.slug}-primary`} /><Cta label={s.secondaryCtaLabel} url={s.secondaryCtaUrl} variant={sec} testid={`cta-${s.slug}-secondary`} /></div>;
}
export function Head({ s, light, kicker, className, h = 'h2' }) {
  if (!s) return null;
  const H = h;
  return (
    <header className={cn('max-w-3xl', className)}>
      {kicker && <p className="eyebrow mb-3">{kicker}</p>}
      <H className={cn('display-lg', light ? 'text-surface' : 'text-navy')}>{s.name}</H>
      <div className="gold-rule mt-5" />
      {has(s.shortDescription) && <p className={cn('mt-5 text-lg leading-relaxed', light ? 'text-surface/80' : 'text-foreground/80')}>{s.shortDescription}</p>}
    </header>
  );
}
export function Body({ s, light }) {
  if (!s || !has(s.description)) return null;
  return <div className={cn('mt-4 max-w-2xl space-y-3 leading-relaxed', light ? 'text-surface/75' : 'text-muted-foreground')}>{String(s.description).split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>;
}
export function Pic({ src, alt = '', className, imgClassName, label, ...rest }) {
  const [bad, setBad] = useState(false);
  const u = mediaUrl(src);
  if (!u || bad) return <div className={cn('navy-surface grid place-items-center overflow-hidden p-4 text-center', className)} role={alt ? 'img' : undefined} aria-label={alt || undefined}><span className="font-display text-xl text-gold">{label ? initials(label) : ''}</span></div>;
  return <img src={u} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={cn('h-full w-full object-cover', imgClassName, className)} {...rest} />;
}
export const Illustrative = () => null;
export function Count({ to, className }) {
  const [ref, vis] = useInView();
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => { if (!vis) return undefined; if (reduce) { setN(to); return undefined; } const c = animate(0, to, { duration: 0.7, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)), onComplete: () => setN(to) }); return () => c.stop(); }, [vis, to, reduce]);
  return <span ref={ref} className={className}>{n}</span>;
}
export const Pending = ({ title, body, children }) => (
  <div className="rounded-lg border border-dashed border-gold-deep/50 bg-gold-soft/40 p-6 sm:p-8">
    <h3 className="text-xl text-navy">{title}</h3>
    <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/75">{body}</p>
    <div className="mt-4 flex flex-wrap gap-3">{children}</div>
  </div>
);
