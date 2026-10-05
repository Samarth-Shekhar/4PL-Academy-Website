import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useListAdminContent, getListAdminContentQueryKey, useCreateContent, useUpdateContent, useArchiveContent } from '@workspace/api-client-react';
import { Plus, Star, Pencil, Archive, RotateCcw, Eye, EyeOff, Loader2, Trash2, Inbox, ShieldCheck } from 'lucide-react';
import { KINDS, SEO_FIELDS, STATUSES } from './kinds';
import { has, slugify, fmtDate, initials } from '@/lib/format';
import { errMsg, invalidateAll } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Modal } from '@/components/Modal';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui-kit';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fieldList(cfg) {
  const base = (cfg.groups || []).flatMap(([, f]) => f);
  return [...base, ...SEO_FIELDS];
}
function itemToForm(item, cfg) {
  const v = { name: item?.name || '', slug: item?.slug || '', status: item?.status || 'draft', featured: !!item?.featured, sortOrder: item?.sortOrder ?? 0, shortDescription: item?.shortDescription || '', description: item?.description || '', verified: !!item?.verified, verificationNotes: item?.verificationNotes || '', partnershipVerified: !!item?.partnershipVerified, source: item?.source || '', universityId: item?.universityId ?? '', universityName: item?.universityName || '', faqs: (item?.faqs || []).map((f) => ({ question: f.question || '', answer: f.answer || '' })) };
  fieldList(cfg).forEach((f) => { v[f.name] = item?.[f.name] ? (f.type === 'date' ? String(item[f.name]).slice(0, 10) : item[f.name]) : ''; });
  (cfg.arrays || []).forEach(([n]) => { v[n] = (item?.[n] || []).join('\n'); });
  return v;
}
function formToPayload(v, cfg) {
  const p = { name: v.name.trim(), slug: v.slug.trim(), status: v.status, featured: !!v.featured, sortOrder: Number(v.sortOrder) || 0, shortDescription: v.shortDescription || '', description: v.description || '', verified: !!v.verified, verificationNotes: v.verificationNotes || '', source: v.source || '' };
  if (cfg.partnership) p.partnershipVerified = !!v.partnershipVerified;
  if (cfg.universityPicker) { p.universityId = v.universityId === '' || v.universityId === null ? null : Number(v.universityId); p.universityName = v.universityName || ''; }
  fieldList(cfg).forEach((f) => { p[f.name] = (v[f.name] || '').toString().trim(); });
  (cfg.arrays || []).forEach(([n]) => { p[n] = String(v[n] || '').split('\n').map((s) => s.trim()).filter(Boolean); });
  if (cfg.faqs) p.faqs = (v.faqs || []).filter((f) => f.question.trim() && f.answer.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));
  return p;
}
const buildSchema = (cfg) => z.object({
  name: z.string().trim().min(1, 'Name is required').max(250),
  slug: z.string().trim().min(1, 'Slug is required').max(250).regex(SLUG_RE, 'Use lowercase letters, numbers and hyphens'),
  status: z.enum(STATUSES), featured: z.boolean(), sortOrder: z.coerce.number().int('Whole number').min(-100000).max(100000),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
}).passthrough().superRefine((v, ctx) => {
  fieldList(cfg).forEach((f) => {
    const x = (v[f.name] || '').toString().trim();
    if (!x) return;
    if (f.type === 'url' && !/^(https?:\/\/|\/)/i.test(x)) ctx.addIssue({ code: 'custom', path: [f.name], message: 'Enter a full URL starting with https://' });
    if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(x)) ctx.addIssue({ code: 'custom', path: [f.name], message: 'Enter a valid email' });
  });
  (v.faqs || []).forEach((f, i) => { if (!!f.question.trim() !== !!f.answer.trim()) ctx.addIssue({ code: 'custom', path: ['faqs', i, f.question.trim() ? 'answer' : 'question'], message: 'Provide both a question and an answer' }); });
});

function Field({ f, register, errors }) {
  const id = `f-${f.name}`;
  const err = errors[f.name];
  return (
    <div className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <label className="label" htmlFor={id}>{f.label}</label>
      {f.type === 'textarea' ? <textarea id={id} className="input" {...register(f.name)} /> : f.type === 'robots' ? (
        <><input id={id} className="input" list="robots-opts" placeholder="index, follow" {...register(f.name)} /><datalist id="robots-opts"><option value="index, follow" /><option value="noindex, follow" /><option value="noindex, nofollow" /></datalist></>
      ) : <input id={id} type={f.type === 'url' ? 'url' : f.type || 'text'} className="input" aria-invalid={!!err} {...register(f.name)} />}
      {f.hint && <p className="hint">{f.hint}</p>}
      {err && <p className="field-err">{err.message}</p>}
    </div>
  );
}
const Group = ({ title, children }) => <fieldset className="rounded-lg border border-line p-4"><legend className="px-2 text-sm font-bold text-navy">{title}</legend><div className="grid gap-4 sm:grid-cols-2">{children}</div></fieldset>;

function EditorForm({ kind, cfg, item, onClose, universities }) {
  const qc = useQueryClient();
  const create = useCreateContent();
  const update = useUpdateContent();
  const isNew = !item;
  const { register, handleSubmit, control, setValue, watch, formState: { errors, dirtyFields } } = useForm({ resolver: zodResolver(buildSchema(cfg)), defaultValues: itemToForm(item, cfg) });
  const { fields, append, remove } = useFieldArray({ control, name: 'faqs' });
  const name = watch('name');
  useEffect(() => { if (isNew && !dirtyFields.slug) setValue('slug', slugify(name)); }, [name, isNew, dirtyFields.slug, setValue]);
  const mut = isNew ? create : update;
  const submit = (v) => {
    const data = formToPayload(v, cfg);
    const done = { onSuccess: () => { invalidateAll(qc); onClose(); } };
    if (isNew) create.mutate({ kind, data }, done); else update.mutate({ kind, id: item.id, data }, done);
  };
  const seoGroup = <Group title="SEO and social metadata">{SEO_FIELDS.map((f) => <Field key={f.name} f={f} register={register} errors={errors} />)}</Group>;
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5" data-testid={`form-admin-${kind}`}>
      {cfg.note && <p className="rounded-md bg-gold-soft p-3 text-sm text-navy">{cfg.note}</p>}
      <Group title="Basics">
        <div><label className="label" htmlFor="f-name">Name</label><input id="f-name" className="input" aria-invalid={!!errors.name} {...register('name')} />{errors.name && <p className="field-err">{errors.name.message}</p>}</div>
        <div><label className="label" htmlFor="f-slug">Slug</label><input id="f-slug" className="input" {...register('slug')} />{cfg.slugHint && <p className="hint">{cfg.slugHint}</p>}{errors.slug && <p className="field-err">{errors.slug.message}</p>}</div>
        <div><label className="label" htmlFor="f-status">Status</label><select id="f-status" className="input" {...register('status')}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="label" htmlFor="f-sort">Sort order</label><input id="f-sort" type="number" inputMode="numeric" className="input" {...register('sortOrder')} />{errors.sortOrder && <p className="field-err">{errors.sortOrder.message}</p>}</div>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-navy sm:col-span-2"><input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" {...register('featured')} /> Featured on the public site</label>
        {cfg.universityPicker && (
          <div className="sm:col-span-2"><label className="label" htmlFor="f-uni">University</label>
            <select id="f-uni" className="input" value={watch('universityId') ?? ''} onChange={(e) => { const u = universities.find((x) => String(x.id) === e.target.value); setValue('universityId', e.target.value, { shouldDirty: true }); setValue('universityName', u ? u.name : '', { shouldDirty: true }); }}>
              <option value="">No university linked</option>{universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select><p className="hint">Linked name: {watch('universityName') || 'none'}</p></div>
        )}
        <div className="sm:col-span-2"><label className="label" htmlFor="f-short">Short description</label><textarea id="f-short" rows={2} className="input" {...register('shortDescription')} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="f-desc">{cfg.descLabel || 'Description'}</label><textarea id="f-desc" rows={cfg.descRows || 7} className="input" {...register('description')} /><p className="hint">Separate paragraphs with a blank line. Start a line with ## for a sub-heading.</p></div>
      </Group>
      {(cfg.groups || []).map(([t, fs]) => <Group key={t} title={t}>{fs.map((f) => <Field key={f.name} f={f} register={register} errors={errors} />)}</Group>)}
      {(cfg.arrays || []).length > 0 && (
        <Group title="Lists (one item per line)">{cfg.arrays.map(([n, l]) => <div key={n} className="sm:col-span-2"><label className="label" htmlFor={`f-${n}`}>{l}</label><textarea id={`f-${n}`} rows={4} className="input" {...register(n)} /></div>)}</Group>
      )}
      {cfg.faqs && (
        <fieldset className="rounded-lg border border-line p-4"><legend className="px-2 text-sm font-bold text-navy">{cfg.faqsLabel || 'FAQs'}</legend>
          <div className="space-y-3">
            {fields.map((fi, i) => (
              <div key={fi.id} className="rounded-md bg-mist/60 p-3">
                <label className="label" htmlFor={`faq-q-${i}`}>Question {i + 1}</label><input id={`faq-q-${i}`} className="input" {...register(`faqs.${i}.question`)} />
                {errors.faqs?.[i]?.question && <p className="field-err">{errors.faqs[i].question.message}</p>}
                <label className="label mt-2" htmlFor={`faq-a-${i}`}>Answer</label><textarea id={`faq-a-${i}`} rows={3} className="input" {...register(`faqs.${i}.answer`)} />
                {errors.faqs?.[i]?.answer && <p className="field-err">{errors.faqs[i].answer.message}</p>}
                <button type="button" onClick={() => remove(i)} className="btn btn-outline btn-sm mt-2"><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => append({ question: '', answer: '' })} className="btn btn-outline btn-sm"><Plus className="h-4 w-4" aria-hidden="true" /> Add question</button>
          </div>
        </fieldset>
      )}
      {seoGroup}
      <Group title="Verification">
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-navy"><input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" {...register('verified')} /> Information verified</label>
        {cfg.partnership && <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-navy"><input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" {...register('partnershipVerified')} /> Partnership with 4PL verified</label>}
        <div className="sm:col-span-2"><label className="label" htmlFor="f-vn">Verification notes</label><textarea id="f-vn" rows={3} className="input" {...register('verificationNotes')} /><p className="hint">Internal. Record what was checked, by whom and when.</p></div>
        {!SEO_FIELDS.length ? null : <div className="sm:col-span-2"><label className="label" htmlFor="f-source">Source</label><input id="f-source" className="input" {...register('source')} /></div>}
      </Group>
      {mut.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{errMsg(mut.error)}</p>}
      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-line bg-card p-4">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-navy" disabled={mut.isPending} data-testid="button-save-content">{mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {isNew ? `Create ${cfg.label.toLowerCase()}` : 'Save changes'}</button>
      </div>
    </form>
  );
}

export default function ContentManager({ kind, embedded }) {
  const cfg = KINDS[kind];
  const qc = useQueryClient();
  const q = useListAdminContent(kind, { query: { queryKey: getListAdminContentQueryKey(kind), staleTime: 10000, refetchOnMount: true } });
  const unis = useListAdminContent('universities', { query: { queryKey: getListAdminContentQueryKey('universities'), staleTime: 30000, enabled: !!cfg.universityPicker } });
  const update = useUpdateContent();
  const archive = useArchiveContent();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [f, setF] = useState({ search: '', status: 'all' });
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');
  const all = q.data || [];
  const counts = useMemo(() => ({ all: all.length, published: all.filter((x) => x.status === 'published').length, draft: all.filter((x) => x.status === 'draft').length, archived: all.filter((x) => x.status === 'archived').length }), [all]);
  const list = useMemo(() => all.filter((x) => (f.status === 'all' || x.status === f.status) && (!f.search || `${x.name} ${x.slug} ${x.universityName || ''} ${x.category || ''}`.toLowerCase().includes(f.search.toLowerCase()))), [all, f]);
  const patch = (item, over, id) => {
    setBusy(`${id}-${item.id}`); setErr('');
    update.mutate({ kind, id: item.id, data: { ...formToPayload(itemToForm(item, cfg), cfg), ...over } }, { onSuccess: () => invalidateAll(qc), onError: (e) => setErr(errMsg(e)), onSettled: () => setBusy(null) });
  };
  const doArchive = () => { archive.mutate({ kind, id: confirm.id }, { onSuccess: () => { invalidateAll(qc); setConfirm(null); }, onError: (e) => setErr(errMsg(e)) }); };
  const Btn = ({ item, id, icon: I, label, over }) => <button type="button" className="btn btn-outline btn-sm" disabled={busy === `${id}-${item.id}`} onClick={() => patch(item, over, id)} data-testid={`button-${id}-${item.id}`}>{busy === `${id}-${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <I className="h-4 w-4" aria-hidden="true" />}{label}</button>;
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!embedded && <p className="max-w-xl text-sm text-muted-foreground">Changes are saved to the database and appear on the public site immediately after publishing.</p>}
        <button type="button" onClick={() => setEditing('new')} className="btn btn-gold self-start sm:ml-auto" data-testid={`button-new-${kind}`}><Plus className="h-4 w-4" aria-hidden="true" /> New {cfg.label.toLowerCase()}</button>
      </div>
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div><label className="sr-only" htmlFor="cm-search">Search</label><input id="cm-search" type="search" className="input" placeholder={`Search ${cfg.plural.toLowerCase()}`} value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} /></div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Status filter">{['all', ...STATUSES].map((s) => <button key={s} type="button" role="tab" aria-selected={f.status === s} onClick={() => setF({ ...f, status: s })} className={cn('shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold capitalize', f.status === s ? 'border-navy bg-navy text-surface' : 'border-line bg-card text-navy')}>{s} ({counts[s]})</button>)}</div>
      </div>
      {err && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{err}</p>}
      {q.isLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Inbox} title={all.length ? 'Nothing matches' : `No ${cfg.plural.toLowerCase()} yet`} body={all.length ? 'Adjust the search or status filter.' : 'Create the first record to get started.'} /> : (
        <ul className="space-y-2">
          {list.map((x) => (
            <li key={x.id} className="card-s p-3 sm:p-4" data-testid={`row-${kind}-${x.id}`}>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-mist text-sm font-bold text-navy">{has(x.image) ? <img src={x.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : initials(x.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5"><h3 className="break-words font-sans text-base font-bold text-navy">{x.name}</h3>{x.featured && <Star className="h-4 w-4 fill-gold text-gold" aria-label="Featured" />}</div>
                  <p className="truncate text-xs text-muted-foreground">/{x.slug}{has(x.universityName) ? ` · ${x.universityName}` : ''} · updated {fmtDate(x.updatedAt)}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5"><span className={cn('chip', x.status === 'published' ? 'chip-ok' : x.status === 'draft' ? 'chip-gold' : 'chip-warn')}>{x.status}</span>{!x.verified && <span className="chip chip-warn">Needs verification</span>}{x.partnershipVerified && <span className="chip chip-ok"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Partner verified</span>}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                <button type="button" className="btn btn-navy btn-sm" onClick={() => setEditing(x)} data-testid={`button-edit-${x.id}`}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
                {x.status === 'draft' && <Btn item={x} id="publish" icon={Eye} label="Publish" over={{ status: 'published' }} />}
                {x.status === 'published' && <Btn item={x} id="unpublish" icon={EyeOff} label="Unpublish" over={{ status: 'draft' }} />}
                {x.status !== 'archived' && <Btn item={x} id="feature" icon={Star} label={x.featured ? 'Unfeature' : 'Feature'} over={{ featured: !x.featured }} />}
                {x.status === 'archived' ? <Btn item={x} id="restore" icon={RotateCcw} label="Restore as draft" over={{ status: 'draft' }} /> : <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirm(x)} data-testid={`button-archive-${x.id}`}><Archive className="h-4 w-4" aria-hidden="true" />Archive</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing === 'new' ? `New ${cfg.label.toLowerCase()}` : `Edit ${cfg.label.toLowerCase()}`} description="Optional text fields can be cleared by emptying them." wide>
        {editing && <EditorForm key={editing === 'new' ? 'new' : editing.id} kind={kind} cfg={cfg} item={editing === 'new' ? null : editing} universities={unis.data || []} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title="Archive this record?" description={confirm ? `"${confirm.name}" will be removed from the public site. You can restore it later.` : ''}>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={archive.isPending} onClick={doArchive} data-testid="button-confirm-archive">{archive.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Archive</button></div>
      </Modal>
    </div>
  );
}
