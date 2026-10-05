import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListAdminLeads, getListAdminLeadsQueryKey, useUpdateLead } from '@workspace/api-client-react';
import { Inbox, Loader2 } from 'lucide-react';
import { fmtDate, has } from '@/lib/format';
import { errMsg, invalidateAll } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui-kit';
import { Modal } from '@/components/Modal';

const STATUSES = ['New', 'Contacted', 'Interested', 'Application Started', 'Applied', 'Admission Confirmed', 'Closed'];
const CATS = ['contact', 'counselling', 'application', 'partnership', 'chatbot'];

export default function Leads({ onlyCategory }) {
  const qc = useQueryClient();
  const q = useListAdminLeads({ query: { queryKey: getListAdminLeadsQueryKey(), staleTime: 15000, refetchOnMount: true } });
  const upd = useUpdateLead();
  const [s, setS] = useState({ search: '', status: '', category: onlyCategory || '' });
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ status: 'New', notes: '' });
  const list = useMemo(() => (q.data || []).filter((l) => (!onlyCategory || l.category === onlyCategory) && (!s.status || l.status === s.status) && (!s.category || l.category === s.category) && (!s.search || `${l.name} ${l.email} ${l.phone} ${l.program || ''} ${l.university || ''} ${l.course || ''} ${l.city || ''} ${l.interestedIn || ''} ${l.qualification || ''}`.toLowerCase().includes(s.search.toLowerCase()))), [q.data, s, onlyCategory]);
  const open = (l) => { setSel(l); setForm({ status: l.status || 'New', notes: l.notes || '' }); upd.reset(); };
  const save = () => upd.mutate({ id: sel.id, data: { status: form.status, notes: form.notes } }, { onSuccess: () => { invalidateAll(qc); setSel(null); } });
  const exportCsv = () => {
    const cols = ['id', 'createdAt', 'name', 'email', 'phone', 'category', 'status', 'interestedIn', 'university', 'program', 'course', 'qualification', 'city', 'message', 'source', 'utm', 'notes'];
    const esc = (v) => { let t = String(v ?? '').replace(/"/g, '""'); if (/^\s*[=+\-@]|^[\t\r\n]/.test(t)) t = `'${t}`; return `"${t}"`; };
    const csv = [cols.join(','), ...list.map((l) => cols.map((c) => esc(l[c])).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'leads.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <div>
      <div className="mb-3 flex justify-end"><button type="button" className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!list.length} data-testid="button-export-leads">Export CSV ({list.length})</button></div>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <div><label className="sr-only" htmlFor="l-search">Search</label><input id="l-search" type="search" className="input" placeholder="Search name, email, phone, program" value={s.search} onChange={(e) => setS({ ...s, search: e.target.value })} /></div>
        <div><label className="sr-only" htmlFor="l-status">Status</label><select id="l-status" className="input" value={s.status} onChange={(e) => setS({ ...s, status: e.target.value })}><option value="">All statuses</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
        {!onlyCategory && <div><label className="sr-only" htmlFor="l-cat">Category</label><select id="l-cat" className="input" value={s.category} onChange={(e) => setS({ ...s, category: e.target.value })}><option value="">All categories</option>{CATS.map((x) => <option key={x}>{x}</option>)}</select></div>}
      </div>
      {q.isLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Inbox} title={onlyCategory ? 'No applications yet' : 'No leads match'} body="New enquiries from the website forms and ACAD BOT will appear here." /> : (
        <ul className="space-y-2">
          {list.map((l) => (
            <li key={l.id}><button type="button" onClick={() => open(l)} className="card-s grid w-full gap-1 p-4 text-left hover:border-gold sm:grid-cols-[1.4fr_1.6fr_auto] sm:items-center sm:gap-4" data-testid={`row-lead-${l.id}`}>
              <span className="min-w-0"><span className="block truncate font-semibold text-navy">{l.name}</span><span className="block truncate text-xs text-muted-foreground">{l.email} &middot; {l.phone}</span></span>
              <span className="min-w-0 text-sm text-foreground/75"><span className="chip mr-2">{l.category || 'contact'}</span><span className="break-words">{[l.interestedIn, l.program, l.course, l.university, l.city].filter(has).join(' / ') || l.source || 'General enquiry'}</span></span>
              <span className="flex items-center gap-2"><span className="chip chip-gold">{l.status}</span><span className="text-xs text-muted-foreground">{fmtDate(l.createdAt)}</span></span>
            </button></li>
          ))}
        </ul>
      )}
      <Modal open={!!sel} onOpenChange={(o) => !o && setSel(null)} title={sel?.name || 'Lead'} description="Update stage and add internal notes." wide>
        {sel && (
          <div className="space-y-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[['Email', sel.email], ['Phone', sel.phone], ['Category', sel.category], ['Interested in', sel.interestedIn], ['Highest qualification', sel.qualification], ['City', sel.city], ['University', sel.university], ['Program', sel.program], ['Course', sel.course], ['Source', sel.source], ['UTM', sel.utm], ['Received', fmtDate(sel.createdAt)]].map(([k, v]) => <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-gold-deep">{k}</dt><dd className="break-words text-navy">{has(v) ? v : 'Not provided'}</dd></div>)}
            </dl>
            {has(sel.message) && <div className="rounded-md bg-mist p-3 text-sm"><p className="text-xs font-bold uppercase tracking-wider text-gold-deep">Message</p><p className="mt-1 whitespace-pre-line">{sel.message}</p></div>}
            <div><label className="label" htmlFor="ld-status">Status</label><select id="ld-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="select-lead-status">{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="label" htmlFor="ld-notes">Notes</label><textarea id="ld-notes" className="input" maxLength={5000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-lead-notes" /></div>
            {upd.isError && <p className="text-sm text-destructive" role="alert">{errMsg(upd.error)}</p>}
            <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setSel(null)}>Cancel</button><button type="button" className="btn btn-navy" disabled={upd.isPending} onClick={save} data-testid="button-save-lead">{upd.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
