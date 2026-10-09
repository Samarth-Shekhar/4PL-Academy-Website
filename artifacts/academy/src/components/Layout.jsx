import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';
import { Menu, ChevronDown, ArrowUp, ArrowRight, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import TechText from './TechText';
import { Modal } from './Modal';
import { AcadBot } from './AcadBot';
import { ScrollTransitions } from './ScrollTransitions';
import { cn } from '@/lib/cn';
import { asset, has } from '@/lib/format';
import { useContactSettings, telHref } from '@/lib/settings';
import { useCompare } from '@/lib/compare';
import { captureAttribution } from '@/lib/booking';

const XIcon = (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const PinterestIcon = (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026z" /></svg>;

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
  { href: '/programs', label: 'AI Programs', ai: true, children: [
    { href: '/programs/bba-in-artificial-intelligence-ai', label: 'BBA in AI Business & Digital Transformation' },
    { href: '/programs/btech-ai-digital-transformation', label: 'B.Tech (Hons.) in AI, Cloud Engineering & DevOps' },
    { href: '/programs/bca-artificial-intelligence', label: 'BCA (Hons.) in AI, Cloud Computing & Cybersecurity' },
    { href: '/programs/mba-ai-business-strategy-digital-transformation', label: 'MBA in AI Business Strategy & Digital Transformation' },
  ] },
  { href: '/universities', label: 'Universities' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/partner-with-us', label: 'Partner With Us' },
  { href: '/contact', label: 'Contact Us' },
];

const toTop = () => {
  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: calm ? 'auto' : 'smooth' });
};
const homeLogoClick = (loc, after) => (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  after?.();
  if (loc === '/') { event.preventDefault(); toTop(); }
};

export const Logo = ({ className = 'h-14', blend = true, transparent = false }) => (
  <img src={asset(transparent ? 'images/4pl-academy-transparent-256.webp' : 'images/4pl-logo-trimmed-256.webp')} srcSet={[128, 256, 384].map(w => `${asset(`images/${transparent ? '4pl-academy-transparent' : '4pl-logo-trimmed'}-${w}.webp`)} ${w}w`).join(', ')} sizes={transparent ? '(min-width: 640px) 106px, 85px' : '96px'} alt="4PL Academy: Creating Global Professionals" className={cn('w-auto', blend && 'logo-blend', className)} width="684" height="519" />
);

function Header() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const header = useRef(null);
  const ptr = useRef('');
  const [scrolled, setScrolled] = useState(false);
  const onLogoClick = homeLogoClick(loc, () => { setOpen(false); setDropdown(null); });
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
    <header ref={header} className={cn('academy-header sticky top-0 z-50', loc === '/' && 'is-home', scrolled && 'is-scrolled')}>
      <div className="container-x flex h-20 items-center sm:h-24 justify-between gap-3">
        <Link href="/" aria-label="4PL Academy home" className="shrink-0" onClick={onLogoClick}><Logo transparent blend={false} className="academy-header-logo h-16 sm:h-20" /></Link>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {NAV.map((n) => {
            const selected = active(n.href) || (n.children || []).some(c => active(c.href));
            const style = cn('relative flex min-h-11 items-center gap-1 rounded px-2.5 py-2 text-[0.95rem] font-normal normal-case text-navy hover:text-gold-deep focus-visible:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:text-gold-deep', selected && 'text-gold-deep');
            return n.children ? (
              <div key={n.href} className="relative" onPointerEnter={(e) => { if (e.pointerType === 'mouse') setDropdown(n.href); }} onPointerLeave={(e) => { if (e.pointerType === 'mouse') setDropdown(null); }} onFocus={(e) => { if (e.target.matches?.(':focus-visible')) setDropdown(n.href); }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropdown(null); }}>
                <button type="button" className={cn(style, dropdown === n.href && 'text-gold-deep')} onPointerDown={(e) => { ptr.current = e.pointerType; }} aria-expanded={dropdown === n.href} aria-controls={`header-${n.href.slice(1)}`} onClick={() => setDropdown(ptr.current === 'mouse' ? n.href : dropdown === n.href ? null : n.href)}>{n.label}<ChevronDown className="h-3 w-3" aria-hidden="true" /></button>
                {dropdown === n.href && <ul id={`header-${n.href.slice(1)}`} className="absolute left-0 top-full min-w-60 rounded-md border border-line bg-surface p-2 shadow-xl">
                  {n.children.map(c => <li key={c.href}><Link href={c.href} onClick={() => setDropdown(null)} className={cn('block min-h-11 rounded px-3 py-3 text-sm text-navy hover:bg-gold-soft hover:text-gold-deep focus-visible:bg-gold-soft focus-visible:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold', active(c.href) && 'text-gold-deep')}>{c.label}</Link></li>)}
                </ul>}
              </div>
            ) : <Link key={n.href} href={n.href} className={cn(style, n.ai && 'nav-ai')} aria-current={selected ? 'page' : undefined} onClick={() => setDropdown(null)}>{n.label}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/book-counselling" className="btn btn-gold btn-sm hidden sm:inline-flex" data-testid="link-header-counselling">Book Counselling</Link>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-navy btn-sm xl:hidden" aria-label="Open menu" data-testid="button-menu"><Menu className="h-5 w-5" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Menu</span></button>
        </div>
      </div>
      <Modal open={open} onOpenChange={setOpen} title="Menu" side="right">
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((n) => n.children ? (
            <details key={n.href} className="group border-b border-line">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-bold uppercase text-navy [&::-webkit-details-marker]:hidden">{n.label}<ChevronDown className="h-4 w-4 text-gold-deep transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
              <ul className="pb-2 pl-3">{n.children.map(c => <li key={c.href}><Link href={c.href} onClick={() => setOpen(false)} className={cn('block min-h-11 rounded px-2 py-3 text-sm font-bold text-navy hover:bg-mist', active(c.href) && 'text-gold-deep')}>{c.label}</Link></li>)}</ul>
            </details>
          ) : <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active(n.href) ? 'page' : undefined} className={cn('flex min-h-12 items-center justify-between border-b border-line font-bold uppercase text-navy', active(n.href) && 'text-gold-deep')}>{n.label}<ArrowRight className="h-4 w-4 text-gold-deep" aria-hidden="true" /></Link>)}
        </nav>
        <Link href="/book-counselling" onClick={() => setOpen(false)} className="btn btn-gold mt-5 w-full">Book Counselling<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
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

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/4placademy', icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com/4placademy/', icon: Instagram },
  { label: 'X', href: 'https://twitter.com/4placademy/', icon: XIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/4pl-academy', icon: Linkedin },
  { label: 'Pinterest', href: 'https://www.pinterest.com/4placademy/', icon: PinterestIcon },
];

function Footer() {
  const [loc] = useLocation();
  const health = useHealthCheck({ query: { queryKey: ['/api/healthz'], staleTime: 60000, retry: false } });
  const contact = useContactSettings();
  const col = (t, items) => (
    <div>
      <h3 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-gold">{t}</h3>
      <ul className="mt-3 space-y-1.5">{items.map((i) => <li key={i.href + i.label}><Link href={i.href} className="text-sm text-surface/80 hover:text-gold hover:underline">{i.label}</Link></li>)}</ul>
    </div>
  );
  return (
    <footer className="relative mt-0 isolate overflow-hidden bg-navy border-t-4 border-gold text-surface">
      <div aria-hidden="true" className="ai-grid pointer-events-none absolute inset-0 -z-10 opacity-20 [filter:invert(1)]" />
      <img aria-hidden="true" alt="" src={asset('images/edtech/neural-cutout-960.webp')} loading="lazy" className="pointer-events-none absolute -right-24 bottom-0 -z-10 w-[40rem] max-w-none opacity-10" />
      <div className="footer-scene relative h-64 overflow-hidden sm:h-80">
        <img alt="" src={asset('images/ai-human-learning/lab-collaboration-1280.webp')} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" />
        <div className="container-x absolute inset-x-0 bottom-3 h-24 text-white sm:h-36 lg:h-44"><TechText text="4PL ACADEMY" fontFamily="Bricolage Grotesque, Figtree, sans-serif" fontWeight={800} fontSize={190} letterSpacing={-0.04} color="#ffffff" accentColor="#e5ac2e" reveal="letter" specks={0} labels={false} selection draggable sweep reach={160} strokeWidth={1.5} /></div>
      </div>
      <div className="container-x py-10">
        <div className="mb-9 flex flex-col justify-between gap-5 border-b border-white/20 pb-8 sm:flex-row sm:items-end">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-gold">AI · Digital transformation · Logistics</p><p className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">Your next chapter starts here.</p></div>
          <Link href="/programs" className="btn btn-gold self-start">Discover programs <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_2.5fr]">
          <div>
            <Link href="/" aria-label="4PL Academy home" className="inline-block" onClick={homeLogoClick(loc)}><span className="block rounded-lg bg-white px-3 py-1.5 "><Logo blend={false} className="h-16 sm:h-20" /></span></Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-surface/80">The learning arm of 4PL Consultancy Ltd, bridging universities and industry.</p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="4PL Academy on social media">
              {SOCIALS.map(({ label, href, icon: I }) => (
                <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={`4PL Academy on ${label}`} title={label} data-testid={`link-social-${label.toLowerCase()}`} className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-gold transition-colors hover:border-gold hover:bg-gold hover:text-navy"><I className="h-5 w-5" aria-hidden="true" /></a></li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-[0.8fr_0.9fr_1fr_1.6fr]">
            {col('Courses', [...NAV.find((item) => item.href === '/courses').children, { href: '/compare', label: 'Compare Programs' }, { href: '/certifications', label: 'Certifications' }])}
            {col('Discover', [{ href: '/universities', label: 'Universities' }, { href: '/career', label: 'Career & Industry' }, { href: '/student-life', label: 'Student Life' }, { href: '/blogs', label: 'Blogs' }])}
            {col('4PL Academy', [{ href: '/', label: 'Home' }, { href: '/about', label: 'About Us' }, { href: '/partner-with-us', label: 'Partner With Us' }, { href: '/careers', label: 'Careers at 4PL' }, { href: '/faq', label: 'FAQ' }, { href: '/book-counselling', label: 'Book Counselling' }])}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-gold">Contact</h3>
              <div className="mt-3 space-y-3 text-sm">
                {contact.isLoading && <div className="h-10 w-32 animate-pulse rounded bg-surface/10" />}
                {contact.offices.map((o) => (
                  <div key={o.id} className="space-y-1">
                    {has(o.name) && <p className="font-bold">{o.name}</p>}
                    {has(o.email) && <a href={`mailto:${o.email}`} className="flex items-start gap-1.5 break-all hover:text-gold hover:underline"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{o.email}</a>}
                    {o.phones.map((p) => <a key={p} href={telHref(p)} className="flex items-center gap-1.5 hover:text-gold hover:underline"><Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{p}</a>)}
                    {has(o.address) && <p className="flex items-start gap-1.5 text-surface/70"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{o.address}</p>}
                  </div>
                ))}
                {!contact.isLoading && !contact.offices.length && <Link href="/contact" className="font-bold text-gold hover:underline">Contact page</Link>}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-surface/15 pt-4 text-xs leading-relaxed text-surface/70">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1"><span>4PL Academy. All rights reserved.</span><span className="sr-only" role="status">{health.isError ? 'Service status: unavailable' : 'Service status: ok'}</span><Link href="/privacy" className="hover:text-gold hover:underline">Privacy Policy</Link><Link href="/terms" className="hover:text-gold hover:underline">Terms and Conditions</Link><Link href="/contact" className="hover:text-gold hover:underline">Contact Us</Link><button type="button" onClick={toTop} className="back-top ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gold/60 px-4 text-gold hover:bg-gold hover:text-navy" data-testid="button-back-to-top"><ArrowUp className="h-4 w-4" aria-hidden="true" />Back to top</button></p>
        </div>
      </div>
    </footer>
  );
}

function CounsellingBand() {
  return (
    <section className="container-x pb-14 pt-6 sm:pb-20" aria-label="Book counselling">
      <div className="band-card navy-surface on-navy relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-12 sm:py-14">
        <div aria-hidden="true" className="band-ring" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-light mb-3">Talk to a person</p>
            <h2 className="display-lg text-surface">Not sure which program fits? Speak with a counsellor.</h2>
            <p className="mt-4 text-surface/75">Share your goals and we will walk you through the options on this website, one conversation at a time.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/book-counselling" className="btn btn-gold btn-hero" data-testid="link-band-counselling">Book Counselling<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/contact" className="btn btn-light btn-hero">Contact 4PL Academy</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Layout({ children }) {
  const [loc] = useLocation();
  useEffect(() => { captureAttribution(); window.scrollTo(0, 0); }, [loc]);
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">Skip to content</a>
      <ScrollTransitions />
      <Header />
      <main id="main" className="flex-1">{children}</main>
      {loc !== '/' && !/^\/(?:book-counselling|counselling|contact|apply)/.test(loc) && <CounsellingBand />}
      <Footer />
      <CompareBar />
      <AcadBot raised={/^\/(?:programs|universities|courses|professional-courses)\/[^/]+\/?$/.test(loc) && !/(?:undergraduate|postgraduate|short-term|long-term)\/?$/.test(loc)} />
    </div>
  );
}
