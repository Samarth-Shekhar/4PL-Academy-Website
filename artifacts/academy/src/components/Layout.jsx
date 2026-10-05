import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';
import { Menu, Bot, ArrowRight, Mail, Phone } from 'lucide-react';
import { Modal } from './Modal';
import { AcadBot } from './AcadBot';
import { cn } from '@/lib/cn';
import { asset } from '@/lib/format';
import { openBot } from '@/lib/events';
import { useCompare } from '@/lib/compare';

const NAV = [
  { href: '/programs', label: 'Programs' },
  { href: '/courses', label: 'Courses' },
  { href: '/universities', label: 'Universities' },
  { href: '/career-industry', label: 'Career & Industry' },
  { href: '/student-life', label: 'Student Life' },
  { href: '/about', label: 'About' },
  { href: '/for-universities', label: 'For Universities' },
];
const MORE = [{ href: '/blogs', label: 'Blogs' }, { href: '/faq', label: 'FAQ' }, { href: '/contact', label: 'Contact' }, { href: '/counselling', label: 'Request Counselling' }];

export const Logo = ({ className = 'h-14', blend = true }) => (
  <img src={asset('images/4pl-logo.jpg')} alt="4PL Academy: Creating Global Professionals" className={cn('w-auto', blend && 'logo-blend', className)} width="160" height="154" />
);

function Header() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { setOpen(false); }, [loc]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const active = (h) => loc === h || loc.startsWith(h + '/');
  return (
    <header className={cn('sticky top-0 z-50 bg-surface transition-shadow', scrolled && 'shadow-[0_6px_24px_-14px_hsl(221_76%_17%/.5)]')}>
      <div className="container-x flex h-[4.25rem] items-center justify-between gap-2">
        <Link href="/" aria-label="4PL Academy home" className="shrink-0"><Logo className="h-14 sm:h-16 -my-1" /></Link>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn('relative rounded px-2.5 py-2 text-[0.88rem] font-semibold text-navy/80 hover:text-navy', active(n.href) && 'text-navy after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:bg-gold')}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => openBot()} className="btn btn-outline btn-sm" data-testid="button-header-bot"><Bot className="h-4 w-4" aria-hidden="true" /><span>ACAD BOT</span></button>
          <Link href="/apply" className="btn btn-gold btn-sm hidden sm:inline-flex" data-testid="link-apply-now">Apply Now</Link>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-navy btn-sm xl:hidden" aria-label="Open menu" data-testid="button-menu"><Menu className="h-5 w-5" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Menu</span></button>
        </div>
      </div>
      <div className="h-px bg-line" />
      <Modal open={open} onOpenChange={setOpen} title="Menu" side="right">
        <nav aria-label="Mobile" className="flex flex-col">
          {[...NAV, ...MORE.slice(0, 3)].map((n) => (
            <Link key={n.href} href={n.href} className={cn('flex min-h-12 items-center justify-between border-b border-line font-semibold text-navy', active(n.href) && 'text-gold-deep')}>{n.label}<ArrowRight className="h-4 w-4 text-gold-deep" aria-hidden="true" /></Link>
          ))}
        </nav>
        <Link href="/apply" className="btn btn-gold mt-6 w-full">Apply Now</Link>
        <Link href="/counselling" className="btn btn-outline mt-3 w-full">Request Counselling</Link>
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
            {col('Learn', [{ href: '/programs/undergraduate', label: 'Undergraduate' }, { href: '/programs/postgraduate', label: 'Postgraduate' }, { href: '/compare', label: 'Compare Programs' }, { href: '/courses/short-term', label: 'Short-Term Courses' }, { href: '/courses/long-term', label: 'Long-Term Courses' }])}
            {col('Discover', [{ href: '/universities', label: 'University Directory' }, { href: '/career-industry', label: 'Career & Industry' }, { href: '/student-life', label: 'Student Life' }, { href: '/blogs', label: 'Blogs' }])}
            {col('4PL Academy', [{ href: '/about', label: 'About' }, { href: '/for-universities', label: 'For Universities' }, { href: '/faq', label: 'FAQ' }, { href: '/contact', label: 'Contact' }, { href: '/apply', label: 'Apply' }, { href: '/counselling', label: 'Counselling' }])}
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
  useEffect(() => { window.scrollTo(0, 0); }, [loc]);
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">Skip to content</a>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
      <AcadBot />
    </div>
  );
}
