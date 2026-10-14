import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useListAdminContent, getListAdminContentQueryKey, useCreateContent, useUpdateContent, useArchiveContent, usePermanentlyDeleteContent } from '@workspace/api-client-react';
import { Plus, Star, Pencil, Archive, RotateCcw, Eye, EyeOff, Loader2, Trash2, Inbox, ShieldCheck } from 'lucide-react';
import { KINDS, SEO_FIELDS, STATUSES } from './kinds';
import { UploadField } from './UploadField';
import { mediaUrl } from '@/lib/home';
import { has, slugify, fmtDate, initials } from '@/lib/format';
import { errMsg, invalidateAll } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Modal } from '@/components/Modal';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui-kit';

const thumbOf = (x) => x.image || x.thumbnailUrl || x.posterUrl || x.logo || (x.type === 'image' ? x.url : '');
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fieldList(cfg) {
  const base = (cfg.groups || []).flatMap(([, f]) => f);
  return [...base, ...SEO_FIELDS];
}
const EMPTY_ITEM = { name: '', description: '', image: '', url: '', altText: '' };
function itemToForm(item, cfg) {
  const v = { name: item?.name || '', slug: item?.slug || '', status: item?.status || 'draft', featured: !!item?.featured, sortOrder: item?.sortOrder ?? 0, shortDescription: item?.shortDescription || '', description: item?.description || '', verified: !!item?.verified, verificationNotes: item?.verificationNotes || '', partnershipVerified: !!item?.partnershipVerified, source: item?.source || '', universityId: item?.universityId ?? '', universityName: item?.universityName || '', faqs: (item?.faqs || []).map((f) => ({ question: f.question || '', answer: f.answer || '' })), semesters: (item?.semesters || []).map((x) => ({ name: x.name || '', modules: (x.modules || []).join('\n') })), items: (item?.items || []).map((i) => ({ ...EMPTY_ITEM, ...i })) };
  fieldList(cfg).forEach((f) => {
    const x = item?.[f.name];
    if (f.type === 'bool') v[f.name] = x === undefined || x === null ? (item ? (f.default ?? false) : (f.default ?? false)) : !!x;
    else if (f.type === 'number' || f.type === 'rel') v[f.name] = x === undefined || x === null ? '' : String(x);
    else v[f.name] = has(x) ? (f.type === 'date' ? String(x).slice(0, 10) : x) : '';
  });
  (cfg.arrays || []).forEach(([n]) => { v[n] = (item?.[n] || []).join('\n'); });
  return v;
}
function formToPayload(v, cfg) {
  const p = { name: v.name.trim(), slug: v.slug.trim(), status: v.status, featured: !!v.featured, sortOrder: Number(v.sortOrder) || 0, shortDescription: v.shortDescription || '', description: v.description || '', verified: !!v.verified, verificationNotes: v.verificationNotes || '', source: v.source || '' };
  if (cfg.partnership) p.partnershipVerified = !!v.partnershipVerified;
  if (cfg.universityPicker) { p.universityId = v.universityId === '' || v.universityId === null ? null : Number(v.universityId); p.universityName = v.universityName || ''; }
  fieldList(cfg).forEach((f) => {
    const x = v[f.name];
    if (f.type === 'bool') p[f.name] = !!x;
    else if (f.type === 'number' || f.type === 'rel') { const t = String(x ?? '').trim(); p[f.name] = t === '' || Number.isNaN(Number(t)) ? null : Number(t); }
    else if (f.type === 'select') { const t = String(x || '').trim(); if (t) p[f.name] = t; }
    else p[f.name] = (x || '').toString().trim();
  });
  if (cfg.mirrorName) p[cfg.mirrorName] = p.name;
  (cfg.arrays || []).forEach(([n]) => { p[n] = String(v[n] || '').split('\n').map((s) => s.trim()).filter(Boolean); });
  if (cfg.faqs) p.faqs = (v.faqs || []).filter((f) => f.question.trim() && f.answer.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));
  if (cfg.semesters) p.semesters = (v.semesters || []).map((x) => ({ name: (x.name || '').trim(), modules: String(x.modules || '').split('\n').map((m) => m.trim()).filter(Boolean) })).filter((x) => x.name);
  if (cfg.items) p.items = (v.items || []).filter((i) => i.name.trim()).map((i) => ({ name: i.name.trim(), description: (i.description || '').trim(), image: (i.image || '').trim(), url: (i.url || '').trim(), altText: (i.altText || '').trim() }));
  return p;
}
const buildSchema = (cfg) => z.object({
  name: z.string().trim().min(1, 'Name is required').max(250),
  slug: z.string().trim().min(1, 'Slug is required').max(250).regex(SLUG_RE, 'Use lowercase letters, numbers and hyphens'),
  status: z.enum(STATUSES), featured: z.boolean(), sortOrder: z.coerce.number().int('Whole number').min(-100000).max(100000),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
}).passthrough().superRefine((v, ctx) => {
  fieldList(cfg).forEach((f) => {
    const x = (v[f.name] ?? '').toString().trim();
    if (!x) return;
    if ((f.type === 'url') && !/^(https?:\/\/|\/)/i.test(x)) ctx.addIssue({ code: 'custom', path: [f.name], message: 'Enter a full URL starting with https://' });
    if (f.type === 'upload' && !/^(https?:\/\/|\/)/i.test(x)) ctx.addIssue({ code: 'custom', path: [f.name], message: 'Use a full URL or an uploaded file' });
    if (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(x)) ctx.addIssue({ code: 'custom', path: [f.name], message: 'Enter a valid email' });
    if (f.type === 'number') { const n = Number(x); if (Number.isNaN(n)) ctx.addIssue({ code: 'custom', path: [f.name], message: 'Enter a number' }); else if ((f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) ctx.addIssue({ code: 'custom', path: [f.name], message: `Must be between ${f.min} and ${f.max}` }); }
  });
  (v.faqs || []).forEach((f, i) => { if (!!f.question.trim() !== !!f.answer.trim()) ctx.addIssue({ code: 'custom', path: ['faqs', i, f.question.trim() ? 'answer' : 'question'], message: 'Provide both a question and an answer' }); });
  if (cfg.itemsLabel === 'Job openings') {
    (v.items || []).forEach((job, i) => {
      if (!job.name?.trim()) ctx.addIssue({ code: 'custom', path: ['items', i, 'name'], message: 'Enter a job title or remove this opening' });
      const link = (job.url || '').trim();
      if (link && !/^\/(?![\/\\])[^\\\u0000-\u001f]*$/.test(link)) {
        try {
          const url = new URL(link);
          if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
        } catch {
          ctx.addIssue({ code: 'custom', path: ['items', i, 'url'], message: 'Use a safe https:// URL or a local route' });
        }
      }
    });
  }
});

function RelSelect({ id, rel, value, onChange }) {
  const q = useListAdminContent(rel, { query: { queryKey: getListAdminContentQueryKey(rel), staleTime: 30000 } });
  const list = (q.data || []).filter((x) => x.status !== 'archived');
  return <select id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}><option value="">None</option>{list.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>;
}

function Field({ f, form, onUploaded }) {
  const { register, errors, setValue, watch } = form;
  const id = `f-${f.name}`;
  const err = errors[f.name];
  const wide = f.type === 'textarea' || f.type === 'upload';
  if (f.type === 'bool') return <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-navy sm:col-span-2"><input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" {...register(f.name)} /> {f.label}</label>;
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label className="label" htmlFor={id}>{f.label}</label>
      {f.type === 'textarea' ? <textarea id={id} className="input" {...register(f.name)} /> : f.type === 'robots' ? (
        <><input id={id} className="input" list="robots-opts" placeholder="index, follow" {...register(f.name)} /><datalist id="robots-opts"><option value="index, follow" /><option value="noindex, follow" /><option value="noindex, nofollow" /></datalist></>
      ) : f.type === 'select' ? <select id={id} className="input" {...register(f.name)}><option value="">Not set</option>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      : f.type === 'rel' ? <RelSelect id={id} rel={f.rel} value={watch(f.name)} onChange={(x) => setValue(f.name, x, { shouldDirty: true })} />
      : f.type === 'upload' ? <UploadField id={id} accept={f.accept} mediaType={watch('type')} value={watch(f.name)} invalid={!!err} register={register(f.name)} onChange={(x) => setValue(f.name, x, { shouldDirty: true })} onUploaded={(p, file) => onUploaded?.(f, p, file)} onBusyChange={form.onUploading} />
      : f.type === 'number' ? <input id={id} type="number" step="any" inputMode="decimal" className="input" aria-invalid={!!err} {...register(f.name)} />
      : <input id={id} type={f.type === 'url' ? 'url' : f.type || 'text'} className="input" aria-invalid={!!err} {...register(f.name)} />}
      {f.hint && <p className="hint">{f.hint}</p>}
      {err && <p className="field-err">{err.message}</p>}
    </div>
  );
}
const Group = ({ title, children }) => <fieldset className="editor-group min-w-0 p-4 sm:p-5"><legend className="px-2 font-display text-base font-extrabold text-navy">{title}</legend><div className="grid gap-4 sm:grid-cols-2">{children}</div></fieldset>;

export function EditorForm({ kind, cfg, item, onClose, universities = [] }) {
  const careers = kind === 'pages' && item?.slug === 'careers';
  if (careers) cfg = { ...cfg, items: true, itemsLabel: 'Job openings' };
  const qc = useQueryClient();
  const create = useCreateContent();
  const update = useUpdateContent();
  const isNew = !item;
  const [savedId, setSavedId] = useState(null);
  const [uploadCount, setUploadCount] = useState(0);
  const { register, handleSubmit, control, setValue, watch, getValues, formState: { errors, dirtyFields } } = useForm({ resolver: zodResolver(buildSchema(cfg)), defaultValues: itemToForm(item, cfg) });
  const { fields, append, remove } = useFieldArray({ control, name: 'faqs' });
  const itemsArr = useFieldArray({ control, name: 'items' });
  const semArr = useFieldArray({ control, name: 'semesters' });
  const onUploading = active => setUploadCount(count=>Math.max(0,count+(active?1:-1)));
  const form = { register, errors, setValue, watch, onUploading };
  const name = watch('name');
  useEffect(() => { if (isNew && !dirtyFields.slug) setValue('slug', slugify(name)); }, [name, isNew, dirtyFields.slug, setValue]);
  const mut = isNew && !savedId ? create : update;
  const submit = (v) => {
    if (uploadCount || create.isPending || update.isPending) return;
    const data = formToPayload(v, cfg);
    const done = { onSuccess: () => { invalidateAll(qc); onClose(); } };
    if (isNew && !savedId) create.mutate({ kind, data }, done); else update.mutate({ kind, id: savedId || item.id, data }, done);
  };
  const onUploaded = async (f, path, file) => {
    if (kind !== 'media' || f.name !== 'url') return;
    const vid = /^video\//.test(file.type);
    const title = getValues('name') || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    setValue('type', vid ? 'video' : 'image', { shouldDirty: true });
    setValue('name', title, { shouldDirty: true });
    if (!getValues('slug')) setValue('slug', `${slugify(title) || 'media'}-${Date.now().toString(36)}`, { shouldDirty: true });
    if (isNew && !savedId) {
      const data = { ...formToPayload({ ...getValues(), url: path, status: 'draft' }, cfg), url: path, status: 'draft' };
      const rec = await create.mutateAsync({kind,data});
      setSavedId(rec.id);
      await invalidateAll(qc);
    }
  };
  const seoGroup = <Group title="SEO and social metadata">{SEO_FIELDS.map((f) => <Field key={f.name} f={f} form={form} onUploaded={onUploaded} />)}</Group>;
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5" data-testid={`form-admin-${kind}`}>
      {cfg.note && <p className="rounded-md bg-gold-soft p-3 text-sm text-navy">{cfg.note}</p>}
      <Group title="Basics">
        <div><label className="label" htmlFor="f-name">{cfg.nameLabel || 'Name'}</label><input id="f-name" className="input" aria-invalid={!!errors.name} {...register('name')} />{errors.name && <p className="field-err">{errors.name.message}</p>}</div>
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
      {(cfg.groups || []).map(([t, fs]) => <Group key={t} title={t}>{fs.map((f) => <Field key={f.name} f={f} form={form} onUploaded={onUploaded} />)}</Group>)}
      {(cfg.arrays || []).length > 0 && (
        <Group title="Lists (one item per line)">{cfg.arrays.map(([n, l]) => <div key={n} className="sm:col-span-2"><label className="label" htmlFor={`f-${n}`}>{l}</label><textarea id={`f-${n}`} rows={4} className="input" {...register(n)} /></div>)}</Group>
      )}
      {cfg.semesters && (
        <fieldset className="rounded-lg border border-line p-4" data-testid="editor-semesters"><legend className="px-2 text-sm font-bold text-navy">Semester-wise curriculum</legend>
          <p className="mb-3 text-xs text-muted-foreground">Add only verified modules. If no semesters are added, the plain curriculum list is shown instead.</p>
          <div className="space-y-4">{semArr.fields.map((sf, i) => (
            <div key={sf.id} className="rounded-md border border-line bg-mist/40 p-3">
              <label className="label" htmlFor={`sem-n-${i}`}>Semester name</label><input id={`sem-n-${i}`} className="input" placeholder="Semester 1" {...register(`semesters.${i}.name`)} />
              <label className="label mt-2" htmlFor={`sem-m-${i}`}>Modules (one per line)</label><textarea id={`sem-m-${i}`} rows={4} className="input" {...register(`semesters.${i}.modules`)} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={i === 0} onClick={() => semArr.move(i, i - 1)} className="btn btn-outline btn-sm">Move up</button>
                <button type="button" disabled={i === semArr.fields.length - 1} onClick={() => semArr.move(i, i + 1)} className="btn btn-outline btn-sm">Move down</button>
                <button type="button" onClick={() => semArr.remove(i)} className="btn btn-outline btn-sm"><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove</button>
              </div>
            </div>
          ))}</div>
          <button type="button" onClick={() => semArr.append({ name: `Semester ${semArr.fields.length + 1}`, modules: '' })} className="btn btn-outline btn-sm mt-3"><Plus className="h-4 w-4" aria-hidden="true" /> Add semester</button>
        </fieldset>
      )}
      {cfg.faqs && (
        <fieldset className="editor-group min-w-0 p-4 sm:p-5"><legend className="px-2 font-display text-base font-extrabold text-navy">{cfg.faqsLabel || 'FAQs'}</legend>
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
      {cfg.items && (
        <fieldset className="editor-group min-w-0 p-4 sm:p-5"><legend className="px-2 font-display text-base font-extrabold text-navy">{cfg.itemsLabel || 'Items'}</legend>
          {careers && <p className="mb-4 text-sm text-muted-foreground">Add only real, available positions. Leave this list empty to show “No open positions right now.” Remove a position when it closes.</p>}
          <div className="space-y-3">
            {itemsArr.fields.map((fi, i) => (
              <div key={fi.id} className="grid gap-3 rounded-md bg-mist/60 p-3 sm:grid-cols-2">
                <div><label className="label" htmlFor={`it-n-${i}`}>{careers ? 'Job title' : `Title ${i + 1}`}</label><input id={`it-n-${i}`} className="input" {...register(`items.${i}.name`)} />{errors.items?.[i]?.name && <p className="field-err">{errors.items[i].name.message}</p>}</div>
                <div><label className="label" htmlFor={`it-u-${i}`}>{careers ? 'Details or application link (optional)' : 'Link (route, URL or bot)'}</label><input id={`it-u-${i}`} className="input" {...register(`items.${i}.url`)} />{errors.items?.[i]?.url && <p className="field-err">{errors.items[i].url.message}</p>}</div>
                <div className="sm:col-span-2"><label className="label" htmlFor={`it-d-${i}`}>{careers ? 'Details, location and job type' : 'Description'}</label><textarea id={`it-d-${i}`} rows={careers ? 4 : 2} className="input" {...register(`items.${i}.description`)} /></div>
                {!careers && <><div className="sm:col-span-2"><label className="label" htmlFor={`it-i-${i}`}>Image</label><UploadField id={`it-i-${i}`} accept="image" value={watch(`items.${i}.image`)} register={register(`items.${i}.image`)} onChange={(x) => setValue(`items.${i}.image`, x, { shouldDirty: true })} onBusyChange={onUploading} /></div>
                <div className="sm:col-span-2"><label className="label" htmlFor={`it-a-${i}`}>Image alt text</label><input id={`it-a-${i}`} className="input" {...register(`items.${i}.altText`)} /></div></>}
                <div className="flex gap-2 sm:col-span-2">
                  <button type="button" disabled={i === 0} onClick={() => itemsArr.move(i, i - 1)} className="btn btn-outline btn-sm">Move up</button>
                  <button type="button" disabled={i === itemsArr.fields.length - 1} onClick={() => itemsArr.move(i, i + 1)} className="btn btn-outline btn-sm">Move down</button>
                  <button type="button" onClick={() => itemsArr.remove(i)} className="btn btn-outline btn-sm"><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => itemsArr.append({ ...EMPTY_ITEM })} className="btn btn-outline btn-sm"><Plus className="h-4 w-4" aria-hidden="true" /> {careers ? 'Add job opening' : 'Add item'}</button>
          </div>
        </fieldset>
      )}
      {seoGroup}
      <Group title="Verification">
        {savedId && <p className="rounded-md bg-gold-soft p-2 text-sm text-navy sm:col-span-2">Upload saved as a draft media record. Review the details, verify and publish when approved.</p>}
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-navy"><input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" {...register('verified')} /> Information verified</label>
        {cfg.partnership && <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-navy"><input type="checkbox" className="h-5 w-5 accent-[hsl(221_76%_17%)]" {...register('partnershipVerified')} /> Partnership with 4PL verified</label>}
        <div className="sm:col-span-2"><label className="label" htmlFor="f-vn">Verification notes</label><textarea id="f-vn" rows={3} className="input" {...register('verificationNotes')} /><p className="hint">Internal. Record what was checked, by whom and when.</p></div>
        {!SEO_FIELDS.length ? null : <div className="sm:col-span-2"><label className="label" htmlFor="f-source">Source</label><input id="f-source" className="input" {...register('source')} /></div>}
      </Group>
      {mut.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{errMsg(mut.error)}</p>}
      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-line bg-card p-4">
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={!!uploadCount || create.isPending || update.isPending}>Cancel</button>
        <button type="submit" className="btn btn-navy" disabled={!!uploadCount || create.isPending || update.isPending} data-testid="button-save-content">{(uploadCount > 0 || mut.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} {uploadCount ? 'Finishing upload…' : isNew && !savedId ? `Create ${cfg.label.toLowerCase()}` : 'Save changes'}</button>
      </div>
    </form>
  );
}

export { itemToForm, formToPayload };
export default function ContentManager({ kind, embedded }) {
  const cfg = KINDS[kind];
  const qc = useQueryClient();
  const q = useListAdminContent(kind, { query: { queryKey: getListAdminContentQueryKey(kind), staleTime: 10000, refetchOnMount: true } });
  const unis = useListAdminContent('universities', { query: { queryKey: getListAdminContentQueryKey('universities'), staleTime: 30000, enabled: !!cfg.universityPicker } });
  const update = useUpdateContent();
  const archive = useArchiveContent();
  const permanentDelete = usePermanentlyDeleteContent();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteErr, setDeleteErr] = useState('');
  const [f, setF] = useState({ search: '', status: 'all' });
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');
  const all = q.data || [];
  const counts = useMemo(() => ({ all: all.length, published: all.filter((x) => x.status === 'published').length, draft: all.filter((x) => x.status === 'draft').length, archived: all.filter((x) => x.status === 'archived').length }), [all]);
  const list = useMemo(() => all.filter((x) => (f.status === 'all' || x.status === f.status) && (!f.search || `${x.name} ${x.slug} ${x.universityName || ''} ${x.category || ''} ${x.section || ''}`.toLowerCase().includes(f.search.toLowerCase()))), [all, f]);
  const patch = (item, over, id) => {
    setBusy(`${id}-${item.id}`); setErr('');
    update.mutate({ kind, id: item.id, data: { ...formToPayload(itemToForm(item, cfg), cfg), ...over } }, { onSuccess: () => invalidateAll(qc), onError: (e) => setErr(errMsg(e)), onSettled: () => setBusy(null) });
  };
  const doArchive = () => { archive.mutate({ kind, id: confirm.id }, { onSuccess: () => { invalidateAll(qc); setConfirm(null); }, onError: (e) => setErr(errMsg(e)) }); };
  const doPermanentDelete = () => {
    if (!deleteConfirm) return;
    setDeleteErr('');
    permanentDelete.mutate({ kind, id: deleteConfirm.id }, {
      onSuccess: () => { invalidateAll(qc); setDeleteConfirm(null); },
      onError: (e) => setDeleteErr(errMsg(e)),
    });
  };
  const Btn = ({ item, id, icon: I, label, over }) => <button type="button" className="btn btn-outline btn-sm" disabled={busy === `${id}-${item.id}`} onClick={() => patch(item, over, id)} data-testid={`button-${id}-${item.id}`}>{busy === `${id}-${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <I className="h-4 w-4" aria-hidden="true" />}{label}</button>;
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!embedded && <p className="max-w-xl text-sm text-muted-foreground">Changes are saved to the database and appear on the public site immediately after publishing.</p>}
        <button type="button" onClick={() => setEditing('new')} className="btn btn-gold self-start sm:ml-auto" data-testid={`button-new-${kind}`}><Plus className="h-4 w-4" aria-hidden="true" /> New {cfg.label.toLowerCase()}</button>
      </div>
      <div className="admin-toolbar mb-4 grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div><label className="sr-only" htmlFor="cm-search">Search</label><input id="cm-search" type="search" className="input search-pill" placeholder={`Search ${cfg.plural.toLowerCase()}`} value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} /></div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Status filter">{['all', ...STATUSES].map((s) => <button key={s} type="button" role="tab" aria-selected={f.status === s} onClick={() => setF({ ...f, status: s })} className={cn('shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold capitalize', f.status === s ? 'border-navy bg-navy text-surface' : 'border-line bg-white text-navy hover:border-gold')}>{s} ({counts[s]})</button>)}</div>
      </div>
      {err && <p className="form-alert mb-3" role="alert">{err}</p>}
      {q.isLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Inbox} title={all.length ? 'Nothing matches' : `No ${cfg.plural.toLowerCase()} yet`} body={all.length ? 'Adjust the search or status filter.' : 'Create the first record to get started.'} /> : (
        <ul className="space-y-2">
          {list.map((x) => (
            <li key={x.id} className="card-s p-3 sm:p-4" data-testid={`row-${kind}-${x.id}`}>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-mist text-sm font-bold text-navy">{has(thumbOf(x)) ? <img src={mediaUrl(thumbOf(x))} alt="" className="h-full w-full object-cover" loading="lazy" /> : initials(x.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5"><h3 className="break-words font-sans text-base font-bold text-navy">{x.name}</h3>{x.featured && <Star className="h-4 w-4 fill-gold text-gold" aria-label="Featured" />}</div>
                  <p className="truncate text-xs text-muted-foreground">/{x.slug}{has(x.universityName) ? ` · ${x.universityName}` : ''} · updated {fmtDate(x.updatedAt)}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5"><span className={cn('chip', x.status === 'published' ? 'chip-ok' : x.status === 'draft' ? 'chip-gold' : 'chip-warn')}>{x.status}</span>{x.enabled === false && <span className="chip chip-warn">Hidden</span>}{!x.verified && <span className="chip chip-warn">Needs verification</span>}{x.partnershipVerified && <span className="chip chip-ok"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Partner verified</span>}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                <button type="button" className="btn btn-navy btn-sm" onClick={() => setEditing(x)} data-testid={`button-edit-${x.id}`}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
                {x.status === 'draft' && <Btn item={x} id="publish" icon={Eye} label="Publish" over={{ status: 'published' }} />}
                {x.status === 'published' && <Btn item={x} id="unpublish" icon={EyeOff} label="Unpublish" over={{ status: 'draft' }} />}
                {x.status !== 'archived' && <Btn item={x} id="feature" icon={Star} label={x.featured ? 'Unfeature' : 'Feature'} over={{ featured: !x.featured }} />}
                {x.status === 'archived' ? <Btn item={x} id="restore" icon={RotateCcw} label="Restore as draft" over={{ status: 'draft' }} /> : <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirm(x)} data-testid={`button-archive-${x.id}`}><Archive className="h-4 w-4" aria-hidden="true" />Archive</button>}
                <button type="button" className="btn btn-outline btn-sm text-destructive" disabled={permanentDelete.isPending} onClick={() => { setDeleteConfirm(x); setDeleteErr(''); }} data-testid={`button-delete-${x.id}`}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete permanently</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing === 'new' ? `New ${cfg.label.toLowerCase()}` : `Edit ${cfg.label.toLowerCase()}`} description="Optional fields can be cleared by emptying them." wide>
        {editing && <EditorForm key={editing === 'new' ? 'new' : editing.id} kind={kind} cfg={cfg} item={editing === 'new' ? null : editing} universities={unis.data || []} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title="Archive this record?" description={confirm ? `"${confirm.name}" will be removed from the public site. You can restore it later.` : ''}>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={archive.isPending} onClick={doArchive} data-testid="button-confirm-archive">{archive.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Archive</button></div>
      </Modal>
      <Modal open={!!deleteConfirm} onOpenChange={(o) => { if (!o && !permanentDelete.isPending) { setDeleteConfirm(null); setDeleteErr(''); } }} title="Permanently delete this record?">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This will permanently delete “{deleteConfirm?.name}” from the CMS and cannot be undone. Related lead records remain saved, but uploaded files in storage are not removed. Records still linked to this item must be reassigned or removed first.</p>
          {deleteErr && <p className="form-alert" role="alert">{deleteErr}</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setDeleteConfirm(null)} disabled={permanentDelete.isPending}>Cancel</button><button type="button" className="btn btn-danger" disabled={permanentDelete.isPending} onClick={doPermanentDelete} data-testid="button-confirm-delete">{permanentDelete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Delete permanently</button></div>
        </div>
      </Modal>
    </div>
  );
}
