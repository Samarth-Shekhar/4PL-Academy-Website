import { Link } from 'wouter';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from '@workspace/api-client-react';
import { AlertTriangle, Landmark, GraduationCap, BookOpen, Newspaper, Inbox, ClipboardList } from 'lucide-react';
import { fmtDate } from '@/lib/format';
import { Skeleton, ErrorState } from '@/components/ui-kit';

export default function Dashboard() {
  const q = useGetAdminDashboard({ query: { queryKey: getGetAdminDashboardQueryKey(), staleTime: 15000, refetchOnMount: true } });
  if (q.isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  if (q.isError) return <ErrorState onRetry={q.refetch} />;
  const d = q.data;
  const tiles = [
    ['Universities', d.universities, Landmark, '/admin/universities'], ['Programs', d.programs, GraduationCap, '/admin/programs'], ['Courses', d.courses, BookOpen, '/admin/courses'],
    ['Blogs', d.blogs, Newspaper, '/admin/blogs'], ['Leads', d.leads, Inbox, '/admin/leads'], ['Applications', d.applications, ClipboardList, '/admin/applications'],
  ];
  const stages = d.leadStages || [];
  return (
    <div className="space-y-6">
      <div className="navy-surface on-navy relative overflow-hidden rounded-[1.5rem] p-6 sm:p-8"><div aria-hidden="true" className="band-ring" /><p className="eyebrow eyebrow-light relative">Overview</p><h2 className="relative mt-2 font-display text-2xl font-extrabold sm:text-3xl">Welcome back. Here is what needs attention.</h2><div className="relative mt-5 flex flex-wrap gap-2"><Link href="/admin/leads" className="btn btn-gold btn-sm">Review leads</Link><Link href="/admin/programs" className="btn btn-light btn-sm">Edit programs</Link><Link href="/admin/homepage" className="btn btn-light btn-sm">Edit homepage</Link></div></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map(([l, n, I, h]) => (
          <Link key={l} href={h} className="card-s group p-4 transition hover:border-gold sm:p-5"><I className="h-5 w-5 text-gold-deep" aria-hidden="true" /><p className="mt-3 font-display text-4xl text-navy" data-testid={`stat-${l.toLowerCase()}`}>{n}</p><p className="text-sm font-semibold text-muted-foreground">{l}</p></Link>
        ))}
        <div className="navy-surface on-navy col-span-2 rounded-[1.25rem] p-4 sm:p-5"><AlertTriangle className="h-5 w-5 text-gold" aria-hidden="true" /><p className="mt-3 font-display text-4xl" data-testid="stat-needs-verification">{d.needsVerification}</p><p className="text-sm text-surface/80">Records needing verification</p></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-s p-4 sm:p-6"><h2 className="text-xl text-navy">Lead pipeline</h2>
          {stages.length ? <div className="mt-4 h-72" role="img" aria-label="Bar chart of leads by stage"><ResponsiveContainer width="100%" height="100%"><BarChart data={stages} margin={{ left: -20, right: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(217 24% 86%)" vertical={false} /><XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" radius={[4, 4, 0, 0]}>{stages.map((s, i) => <Cell key={s.status} fill={i % 2 ? 'hsl(40 64% 50%)' : 'hsl(221 76% 17%)'} />)}</Bar></BarChart></ResponsiveContainer></div> : <p className="mt-4 text-sm text-muted-foreground">No leads yet.</p>}
        </section>
        <section className="card-s p-4 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-xl text-navy">Recent leads</h2><Link href="/admin/leads" className="text-sm font-semibold text-gold-deep">View all</Link></div>
          {(d.recentLeads || []).length ? <ul className="mt-3 divide-y divide-line">{d.recentLeads.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-semibold text-navy">{l.name}</p><p className="truncate text-xs text-muted-foreground">{l.category} &middot; {[l.program, l.course, l.university].filter(Boolean)[0] || l.source || 'General'} &middot; {fmtDate(l.createdAt)}</p></div><span className="chip chip-gold shrink-0">{l.status}</span></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">No leads captured yet.</p>}
        </section>
      </div>
    </div>
  );
}
