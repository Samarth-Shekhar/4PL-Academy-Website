import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';
import { Menu, ChevronDown, ArrowRight, Mail, Phone } from 'lucide-react';
import { Modal } from './Modal';
import { AcadBot } from './AcadBot';
import { cn } from '@/lib/cn';
import { asset } from '@/lib/format';
import { useCompare } from '@/lib/compare';
import { captureAttribution } from '@/lib/booking';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/courses', label: 'Courses', children: [
    { href: '/courses', label: 'All Courses' },
    { href: '/programs/undergraduate', label: 'Undergraduate Programs' },
    { href: '/programs/postgraduate', label: 'Postgraduate Programs' },
    { href: '/courses/short-term', label: 'Short-Term Courses' },
    { href: '/courses/long-term', label: 'Long-Term Courses' },
  ] },
  { href: '/universities', label: 'Universities', children: [
    { href: '/universities', label: 'University Directory' },
    { href: '/for-universities', label: 'For Universities' },
  ] },
  { href: '/blogs', label: 'Blogs' },
  { href: '/contact', label: 'Contact Us' },
];

export const Logo = ({ className = 'h-14', blend = true }) => (
  <img src={asset('images/4pl-logo.jpg')} alt="4PL Academy: Creating Global Professionals" className={cn('w-auto', blend && 'logo-blend', className)} width="160" height="154" />
);

function Header() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const header = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { setOpen(false); setDropdown(null); }, [loc]);
  useEffect(() => {
    if (!dropdown) return undefined;
    const outside = (e) => { if (!header.current?.contains(e.target)) setDropdown(null); };
    const escape = (e) => {
      if (e.key !== 'Escape') return;
      header.current?.querySelector(`[aria-controls="header-${dropdown.slice(1)}"]`)?.focus();
      setDropdown(null);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [dropdown]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const active = (h) => loc === h || loc.startsWith(h + '/');
  return (
    <header ref={header} className={cn('sticky top-0 z-50 bg-white transition-shadow', scrolled && 'shadow-[0_6px_24px_-14px_hsl(221_76%_17%/.5)]')}>
      <div className="container-x flex h-[4.25rem] items-center justify-between gap-2">
        <Link href="/" aria-label="4PL Academy home" className="shrink-0"><Logo className="h-14 sm:h-16 -my-1" /></Link>
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
          {NAV.map((n) => {
            const selected = active(n.href) || (n.children || []).some(c => active(c.href));
            const style = cn('relative flex min-h-11 items-center gap-1 rounded px-3 py-2 text-[0.82rem] font-medium uppercase text-navy/80 hover:text-navy', selected && 'text-gold-deep');
            return n.children ? (
              <div key={n.href} className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropdown(null); }}>
                <button type="button" className={style} aria-expanded={dropdown === n.href} aria-controls={`header-${n.href.slice(1)}`} onClick={() => setDropdown(dropdown === n.href ? null : n.href)}>{n.label}<ChevronDown className="h-3 w-3" aria-hidden="true" /></button>
                {dropdown === n.href && <ul id={`header-${n.href.slice(1)}`} className="absolute left-0 top-full min-w-60 rounded-md border border-line bg-surface p-2 shadow-xl">
                  {n.children.map(c => <li key={c.href}><Link href={c.href} onClick={() => setDropdown(null)} className={cn('block min-h-11 rounded px-3 py-3 text-sm text-navy hover:bg-mist', active(c.href) && 'font-semibold text-gold-deep')}>{c.label}</Link></li>)}
                </ul>}
              </div>
            ) : <Link key={n.href} href={n.href} className={style} aria-current={selected ? 'page' : undefined} onClick={() => setDropdown(null)}>{n.label}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn btn-navy btn-sm lg:hidden" aria-label="Open menu" data-testid="button-menu"><Menu className="h-5 w-5" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Menu</span></button>
        </div>
      </div>
      <div className="h-px bg-line" />
      <Modal open={open} onOpenChange={setOpen} title="Menu" side="right">
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((n) => n.children ? (
            <details key={n.href} className="group border-b border-line">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium uppercase text-navy [&::-webkit-details-marker]:hidden">{n.label}<ChevronDown className="h-4 w-4 text-gold-deep transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
              <ul className="pb-2 pl-3">{n.children.map(c => <li key={c.href}><Link href={c.href} onClick={() => setOpen(false)} className={cn('block min-h-11 rounded px-2 py-3 text-sm text-navy hover:bg-mist', active(c.href) && 'font-semibold text-gold-deep')}>{c.label}</Link></li>)}</ul>
            </details>
          ) : <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active(n.href) ? 'page' : undefined} className={cn('flex min-h-12 items-center justify-between border-b border-line font-medium uppercase text-navy', active(n.href) && 'text-gold-deep')}>{n.label}<ArrowRight className="h-4 w-4 text-gold-deep" aria-hidden="true" /></Link>)}
        </nav>
      </Modal>
    </header>
  );
}

function CompareBar() {
  const { ids, clear } = useCompare();
  const [loc] = useLocation();
  if (!ids.length || loc === '/compare') return null;
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg bg-navy px-4 py-3 text-surface shadow-xl sm:left-6 sm:right-auto sm:bottom-6">
      <span className="text-sm font-semibold">{ids.length} program{ids.length > 1 ? 's' : ''} selected</span>
      <div className="flex gap-2">
        <button type="button" className="btn btn-light btn-sm" onClick={clear}>Clear</button>
        <Link href="/compare" className={cn('btn btn-gold btn-sm', ids.length < 2 && 'pointer-events-none opacity-60')} aria-disabled={ids.length < 2}>Compare</Link>
      </div>
    </div>
  );
}

function Footer() {
  const health = useHealthCheck({ query: { queryKey: ['/api/healthz'], staleTime: 60000, retry: false } });
  const col = (t, items) => (
    <div>
      <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gold">{t}</h3>
      <ul className="mt-4 space-y-2.5">{items.map((i) => <li key={i.href}><Link href={i.href} className="text-sm text-surface/75 hover:text-gold">{i.label}</Link></li>)}</ul>
    </div>
  );
  return (
    <footer className="navy-surface on-navy mt-20">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="inline-block rounded-lg bg-surface px-3 py-2"><Logo className="h-20" /></div>
            <p className="mt-5 max-w-sm font-display text-2xl leading-snug text-surface">Creating Global Professionals</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-surface/70">4PL Academy is the learning arm of 4PL Consultancy Ltd, bridging universities and industry to create career-ready graduates.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold"><Mail className="h-4 w-4" aria-hidden="true" /> Speak with admissions</Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {col('Learn', [{ href: '/programs/undergraduate', label: 'Undergraduate' }, { href: '/programs/postgraduate', label: 'Postgraduate' }, { href: '/compare', label: 'Compare Programs' }, { href: '/professional-courses', label: 'Professional Courses' }, { href: '/certifications', label: 'Certifications' }])}
            {col('Discover', [{ href: '/universities', label: 'University Directory' }, { href: '/career-industry', label: 'Career & Industry' }, { href: '/student-life', label: 'Student Life' }, { href: '/blogs', label: 'Blogs' }])}
            {col('4PL Academy', [{ href: '/about', label: 'About' }, { href: '/for-universities', label: 'For Universities' }, { href: '/faq', label: 'FAQ' }, { href: '/contact', label: 'Contact' }, { href: '/apply', label: 'Apply' }, { href: '/book-counselling', label: 'Book Counselling' }])}
          </div>
        </div>
        <div className="mt-12 border-t border-surface/15 pt-6 text-xs leading-relaxed text-surface/60">
          <p>Admission, training and placement support is provided; admission, employment and salary outcomes are never guaranteed. University directory entries are discovery records and do not imply a confirmed partnership with 4PL Academy unless marked verified. Imagery on this site is representative and generic unless stated otherwise.</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1"><span>4PL Academy. All rights reserved.</span><span className="sr-only" role="status">{health.isError ? 'Service status: unavailable' : 'Service status: ok'}</span><Link href="/admin/login" className="underline-offset-4 hover:underline">Staff sign in</Link><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden="true" />Contact details on the Contact page</span></p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }) {
  const [loc] = useLocation();
  useEffect(() => { captureAttribution(); window.scrollTo(0, 0); }, [loc]);
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">Skip to content</a>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
      <AcadBot raised={/^\/(?:programs|universities|courses|professional-courses)\/[^/]+\/?$/.test(loc) && !/(?:undergraduate|postgraduate|short-term|long-term)\/?$/.test(loc)} />
    </div>
  );
}
