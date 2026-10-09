import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListAdminLeads, getListAdminLeadsQueryKey, useUpdateLead, useDeleteLead } from '@workspace/api-client-react';
import { Inbox, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { fmtDate, has } from '@/lib/format';
import { errMsg, invalidateAll } from '@/lib/api';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui-kit';
import { Modal } from '@/components/Modal';
import { PhoneField } from '@/components/PhoneField';
import { getPhoneError, normalizePhone, initialPhoneFields } from '@/lib/phone';

const STATUSES = ['New', 'Contacted', 'Interested', 'Application Started', 'Applied', 'Admission Confirmed', 'Closed'];
export const FORMS = {
  contact: 'Contact Us',
  counselling: 'Counselling',
  partnership: 'Partner With Us',
  careers: 'Careers enquiry',
  chatbot: 'Chatbot callback',
  application: 'Legacy application',
};
const CATS = Object.keys(FORMS);
const TEXT_FIELDS = ['university', 'program', 'course', 'interestedIn', 'qualification', 'city', 'source', 'utm'];
const LABELS = { university: 'University', program: 'Program', course: 'Course', interestedIn: 'Interested in', qualification: 'Highest qualification', city: 'City', source: 'Source', utm: 'Tracking (UTM)' };
const CSV_COLS = ['id', 'createdAt', 'category', 'status', 'name', 'email', 'phone', 'phoneCountry', 'consent', 'university', 'program', 'course', 'interestedIn', 'qualification', 'city', 'source', 'utm', 'message', 'notes'];
const EDITABLE = ['name', 'email', 'category', 'status', 'notes', 'message', ...TEXT_FIELDS];

const toForm = (l) => {
  const f = {};
  EDITABLE.forEach((k) => { f[k] = l[k] ?? ''; });
  f.status = l.status || 'New';
  f.category = l.category || 'contact';
  return { ...f, ...initialPhoneFields(l.phone, l.phoneCountry) };
};

function Editor({ lead, onClose }) {
  const qc = useQueryClient();
  const upd = useUpdateLead();
  const del = useDeleteLead();
  const init = useMemo(() => toForm(lead), [lead]);
  const [f, setF] = useState(init);
  const [errs, setErrs] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [ack, setAck] = useState(false);
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrs((p) => ({ ...p, [k]: '' })); };
  const phoneChanged = f.phone !== init.phone || f.phoneCountry !== init.phoneCountry;

  const save = () => {
    const e = {};
    if (String(f.name).trim().length < 2) e.name = 'Enter the lead’s full name (at least 2 characters).';
    if (f.email !== init.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.';
    if (phoneChanged) { const pe = getPhoneError(f.phone, f.phoneCountry); if (pe) e.phone = pe; }
    setErrs(e);
    if (Object.keys(e).length) return;
    const data = {};
    EDITABLE.forEach((k) => { if (f[k] !== init[k]) data[k] = typeof f[k] === 'string' ? f[k].trim() === f[k] || k === 'message' || k === 'notes' ? f[k] : f[k].trim() : f[k]; });
    if (phoneChanged) { data.phone = normalizePhone(f.phone, f.phoneCountry); data.phoneCountry = f.phoneCountry; }
    if (!Object.keys(data).length) { onClose(); return; }
    upd.mutate({ id: lead.id, data }, { onSuccess: () => { invalidateAll(qc); onClose(); } });
  };
  const remove = () => del.mutate({ id: lead.id }, { onSuccess: () => { invalidateAll(qc); onClose(); } });
  const Err = ({ k }) => (errs[k] ? <p className="mt-1 text-xs text-destructive" role="alert">{errs[k]}</p> : null);

  if (confirming) {
    return (
      <div className="space-y-4" data-testid="panel-delete-lead">
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-navy">Permanently delete {lead.name}?</p>
          <p className="mt-1 text-foreground/80">This removes the {FORMS[lead.category] || 'lead'} record, notes and tracking data from the admissions workspace. It cannot be undone. Email copies already sent to the team or the enquirer are unaffected and will not be recalled.</p>
        </div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={ack} onChange={(e) => setAck(e.target.checked)} disabled={del.isPending} data-testid="checkbox-confirm-delete" /> I understand this record will be permanently deleted.</label>
        {del.isError && <p className="text-sm text-destructive" role="alert">{errMsg(del.error)}</p>}
        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" className="btn btn-outline" disabled={del.isPending} onClick={() => { setConfirming(false); setAck(false); del.reset(); }}><ArrowLeft className="h-4 w-4" /> Back to lead</button>
          <button type="button" className="btn btn-navy" disabled={!ack || del.isPending} onClick={remove} data-testid="button-confirm-delete-lead">{del.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete permanently</button>
        </div>
      </div>
    );
  }
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
      <dl className="grid gap-3 rounded-md bg-mist p-3 text-sm sm:grid-cols-3">
        <div><dt className="text-xs font-bold uppercase tracking-wider text-gold-deep">Form</dt><dd className="text-navy">{FORMS[lead.category] || lead.category}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-gold-deep">Received</dt><dd className="text-navy">{fmtDate(lead.createdAt)}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-gold-deep">Consent captured</dt><dd className="text-navy">{lead.consent === true ? 'Yes' : lead.consent === false ? 'No' : 'Not recorded'}</dd></div>
      </dl>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor="ld-name">Name</label><input id="ld-name" className="input" value={f.name} onChange={(e) => set('name', e.target.value)} /><Err k="name" /></div>
        <div><label className="label" htmlFor="ld-email">Email</label><input id="ld-email" type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} /><Err k="email" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="ld-phone">Phone</label><PhoneField id="ld-phone" value={f.phone} country={f.phoneCountry} onChange={(v) => set('phone', v)} onCountryChange={(c) => set('phoneCountry', c)} error={errs.phone} disabled={upd.isPending} />{!phoneChanged && has(lead.phone) && <p className="mt-1 text-xs text-muted-foreground">Stored value: {lead.phone}. Left untouched unless edited.</p>}</div>
        <div><label className="label" htmlFor="ld-cat">Form</label><select id="ld-cat" className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATS.map((x) => <option key={x} value={x}>{FORMS[x]}</option>)}</select></div>
        <div><label className="label" htmlFor="ld-status">Status</label><select id="ld-status" className="input" value={f.status} onChange={(e) => set('status', e.target.value)} data-testid="select-lead-status">{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
        {TEXT_FIELDS.map((k) => <div key={k}><label className="label" htmlFor={`ld-${k}`}>{LABELS[k]}</label><input id={`ld-${k}`} className="input" value={f[k]} onChange={(e) => set(k, e.target.value)} /></div>)}
      </div>
      <div><label className="label" htmlFor="ld-message">Message / additional details</label><textarea id="ld-message" rows={6} className="input" value={f.message} onChange={(e) => set('message', e.target.value)} /></div>
      <div><label className="label" htmlFor="ld-notes">Internal notes</label><textarea id="ld-notes" className="input" maxLength={5000} value={f.notes} onChange={(e) => set('notes', e.target.value)} data-testid="input-lead-notes" /></div>
      {upd.isError && <p className="text-sm text-destructive" role="alert">{errMsg(upd.error)}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn btn-outline" onClick={() => setConfirming(true)} disabled={upd.isPending} data-testid="button-delete-lead"><Trash2 className="h-4 w-4" /> Delete</button>
        <div className="flex gap-2"><button type="button" className="btn btn-outline" disabled={upd.isPending} onClick={onClose}>Cancel</button><button type="submit" className="btn btn-navy" disabled={upd.isPending} data-testid="button-save-lead">{upd.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</button></div>
      </div>
    </form>
  );
}

export default function Leads({ onlyCategory }) {
  const q = useListAdminLeads({ query: { queryKey: getListAdminLeadsQueryKey(), staleTime: 15000, refetchOnMount: true } });
  const [s, setS] = useState({ search: '', status: '', category: '' });
  const [sel, setSel] = useState(null);
  const all = q.data || [];
  const counts = useMemo(() => { const c = {}; all.forEach((l) => { c[l.category] = (c[l.category] || 0) + 1; }); return c; }, [all]);
  const cat = onlyCategory || s.category;
  const list = useMemo(() => all.filter((l) => (!cat || l.category === cat) && (!s.status || l.status === s.status) && (!s.search || [l.name, l.email, l.phone, l.program, l.university, l.course, l.city, l.interestedIn, l.qualification, l.message, l.source, l.utm, l.notes].join(' ').toLowerCase().includes(s.search.toLowerCase()))), [all, s, cat]);
  const name = onlyCategory ? FORMS[onlyCategory] : 'All forms';
  const exportCsv = () => {
    const esc = (v) => { let t = String(v ?? '').replace(/"/g, '""'); if (/^\s*[=+\-@]|^[\t\r]/.test(t)) t = `'${t}`; return `"${t}"`; };
    const csv = [CSV_COLS.join(','), ...list.map((l) => CSV_COLS.map((c) => esc(l[c])).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${(cat || 'all')}-leads.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  const showForm = !onlyCategory;
  return (
    <div>
      {showForm && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {CATS.map((c) => <button key={c} type="button" onClick={() => setS({ ...s, category: s.category === c ? '' : c })} className={`card-s p-3 text-left hover:border-gold ${s.category === c ? 'border-gold bg-gold-soft/50 ring-2 ring-gold/40' : ''}`} aria-pressed={s.category === c}><span className="block text-xs font-bold uppercase tracking-wider text-gold-deep">{FORMS[c]}</span><span className="font-display text-2xl text-navy">{counts[c] || 0}</span></button>)}
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{name}: {list.length} shown</p><button type="button" className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!list.length} data-testid="button-export-leads">Export CSV ({list.length})</button></div>
      <div className="admin-toolbar mb-5 grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div><label className="sr-only" htmlFor="l-search">Search</label><input id="l-search" type="search" className="input search-pill" placeholder="Search name, email, phone, program, message" value={s.search} onChange={(e) => setS({ ...s, search: e.target.value })} /></div>
        <div><label className="sr-only" htmlFor="l-status">Status</label><select id="l-status" className="input" value={s.status} onChange={(e) => setS({ ...s, status: e.target.value })}><option value="">All statuses</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
      </div>
      {q.isLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Inbox} title={`No ${name.toLowerCase()} submissions`} body="Matching enquiries will appear here as they arrive." /> : (
        <div className="card-s overflow-x-auto" tabIndex={0} aria-label="Leads table, scroll horizontally on small screens">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead><tr className="border-b border-line text-xs font-bold uppercase tracking-wider text-gold-deep"><th className="p-3">Name</th><th className="p-3">Contact</th>{showForm && <th className="p-3">Form</th>}<th className="p-3">Details</th><th className="p-3">Status</th><th className="p-3">Received</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.id} className="border-b border-line/60 align-top hover:bg-mist/60" data-testid={`row-lead-${l.id}`}>
                  <td className="p-3 font-semibold text-navy">{l.name}</td>
                  <td className="p-3"><span className="block break-all">{l.email}</span><span className="block text-xs text-muted-foreground">{l.phone}</span></td>
                  {showForm && <td className="p-3"><span className="chip">{FORMS[l.category] || l.category}</span></td>}
                  <td className="max-w-xs p-3 text-foreground/75"><span className="line-clamp-2 break-words">{[l.interestedIn, l.program, l.course, l.university, l.city].filter(has).join(' / ') || l.message || l.source || 'General enquiry'}</span></td>
                  <td className="p-3"><span className="chip chip-gold whitespace-nowrap">{l.status}</span></td>
                  <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{fmtDate(l.createdAt)}</td>
                  <td className="p-3 text-right"><button type="button" className="btn btn-outline btn-sm" onClick={() => setSel(l)}>View / edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!sel} onOpenChange={(o) => !o && setSel(null)} title={sel?.name || 'Lead'} description={sel ? `${FORMS[sel.category] || 'Lead'}: review, edit or delete.` : ''} wide>
        {sel && <Editor key={sel.id} lead={sel} onClose={() => setSel(null)} />}
      </Modal>
    </div>
  );
}
