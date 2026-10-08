import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminLogout, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { LayoutDashboard, Landmark, GraduationCap, BookOpen, Newspaper, HelpCircle, Image, Search, FileText, Inbox, ClipboardList, Settings, LogOut, Menu, ExternalLink, LayoutTemplate, Building2, Award, Quote } from 'lucide-react';
import { useAdminSession } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { cn } from '@/lib/cn';
import { Modal } from '@/components/Modal';
import { Logo } from '@/components/Layout';
import { Skeleton } from '@/components/ui-kit';

export const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/universities', label: 'Universities', icon: Landmark },
  { href: '/admin/programs', label: 'Programs', icon: GraduationCap },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/homepage', label: 'Homepage', icon: LayoutTemplate },
  { href: '/admin/industry-companies', label: 'Industry companies', icon: Building2 },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/leads', label: 'All leads', icon: Inbox },
  { href: '/admin/contact-leads', label: 'Contact Us leads', icon: Inbox },
  { href: '/admin/counselling-leads', label: 'Counselling booking', icon: Inbox },
  { href: '/admin/partner-leads', label: 'Partner With Us leads', icon: Inbox },
  { href: '/admin/careers-leads', label: 'Careers enquiries', icon: Inbox },
  { href: '/admin/callback-leads', label: 'Chatbot callbacks', icon: Inbox },
  { href: '/admin/applications', label: 'Legacy applications', icon: ClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function NavList({ loc }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5">
      {ADMIN_NAV.map((n) => (
        <Link key={n.href} href={n.href} className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-surface/75 hover:bg-surface/10 hover:text-surface', loc === n.href && 'bg-gold text-navy hover:bg-gold hover:text-navy')}>
          <n.icon className="h-4 w-4" aria-hidden="true" />{n.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminLayout({ children, title }) {
  const [loc, nav] = useLocation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const session = useAdminSession();
  const logout = useAdminLogout();
  useSeo({ title: `${title} | Admin`, noindex: true });
  useEffect(() => { setOpen(false); }, [loc]);
  const authed = session.data?.authenticated;
  useEffect(() => { if (!session.isLoading && !session.isError && !authed) nav('/admin/login'); }, [session.isLoading, session.isError, authed, nav]);
  const doLogout = () => logout.mutate(undefined, { onSettled: () => { qc.setQueryData(getGetAdminSessionQueryKey(), { authenticated: false, setupRequired: false }); qc.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('/api/admin') && !String(q.queryKey[0]).includes('session') }); nav('/admin/login'); } });
  if (session.isLoading || (!authed && !session.isError)) return <div className="grid min-h-[100dvh] place-items-center p-6"><div className="w-full max-w-sm space-y-3"><Skeleton className="h-10" /><Skeleton className="h-40" /></div></div>;
  if (session.isError) return <div className="grid min-h-[100dvh] place-items-center p-6 text-center"><div><p className="font-display text-2xl text-navy">Could not verify your session</p><button type="button" onClick={() => session.refetch()} className="btn btn-navy mt-4">Retry</button></div></div>;
  return (
    <div className="min-h-[100dvh] bg-mist/60 lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="navy-surface on-navy hidden flex-col p-4 lg:flex lg:h-[100dvh] lg:sticky lg:top-0">
        <div className="mb-5 rounded-md bg-surface px-2 py-1"><Logo className="mx-auto h-16" /></div>
        <p className="eyebrow mb-3 px-3">Content studio</p>
        <div className="flex-1 overflow-y-auto"><NavList loc={loc} /></div>
        <a href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 px-3 py-2 text-xs text-surface/70 hover:text-gold"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View public site</a>
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3"><button type="button" onClick={() => setOpen(true)} className="btn btn-navy btn-sm lg:hidden" aria-label="Open admin menu"><Menu className="h-5 w-5" /></button><h1 className="font-display text-xl text-navy sm:text-2xl">{title}</h1></div>
          <div className="flex items-center gap-3"><span className="hidden max-w-[14rem] truncate text-xs text-muted-foreground sm:block">{session.data.email}</span><button type="button" onClick={doLogout} disabled={logout.isPending} className="btn btn-outline btn-sm" data-testid="button-logout"><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button></div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
      <Modal open={open} onOpenChange={setOpen} title="Admin menu" side="right"><div className="rounded-md bg-navy p-2"><NavList loc={loc} /></div></Modal>
    </div>
  );
}
