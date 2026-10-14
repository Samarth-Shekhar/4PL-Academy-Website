import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListAdminContent, getListAdminContentQueryKey, useUpdateContent, useArchiveContent, usePermanentlyDeleteContent } from '@workspace/api-client-react';
import { ArrowUp, ArrowDown, Pencil, Plus, Eye, EyeOff, Star, Loader2, Layers, ExternalLink, Archive, Trash2, RotateCcw } from 'lucide-react';
import { KINDS } from './kinds';
import { EditorForm, formToPayload, itemToForm } from './ContentManager';
import { errMsg, invalidateAll } from '@/lib/api';
import { mediaUrl } from '@/lib/home';
import { has, initials } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Modal } from '@/components/Modal';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui-kit';

const cfg = KINDS.homepage;
export default function HomepageManager() {
  const qc = useQueryClient();
  const q = useListAdminContent('homepage', { query: { queryKey: getListAdminContentQueryKey('homepage'), staleTime: 5000, refetchOnMount: true } });
  const update = useUpdateContent();
  const archive = useArchiveContent();
  const permanentDelete = usePermanentlyDeleteContent();
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const list = useMemo(() => (q.data || []).filter((x) => x.status !== 'archived').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id), [q.data]);
  const archived = useMemo(() => (q.data || []).filter((x) => x.status === 'archived'), [q.data]);
  const save = async (item, over, tag) => {
    setBusy(`${tag}-${item.id}`); setErr('');
    try { await update.mutateAsync({ kind: 'homepage', id: item.id, data: { ...formToPayload(itemToForm(item, cfg), cfg), ...over } }); invalidateAll(qc); } catch (e) { setErr(errMsg(e)); } finally { setBusy(null); }
  };
  const move = async (i, d) => {
    const j = i + d; if (j < 0 || j >= list.length) return;
    const next = list.slice(); [next[i], next[j]] = [next[j], next[i]];
    setBusy('move'); setErr('');
    try { for (let k = 0; k < next.length; k++) { if (next[k].sortOrder !== (k + 1) * 10) await update.mutateAsync({ kind: 'homepage', id: next[k].id, data: { ...formToPayload(itemToForm(next[k], cfg), cfg), sortOrder: (k + 1) * 10 } }); } invalidateAll(qc); } catch (e) { setErr(errMsg(e)); } finally { setBusy(null); }
  };
  const deleteSection = () => {
    if (!deleteConfirm) return;
    setDeleteErr('');
    permanentDelete.mutate({ kind: 'homepage', id: deleteConfirm.id }, {
      onSuccess: () => { invalidateAll(qc); setDeleteConfirm(null); },
      onError: (e) => setDeleteErr(errMsg(e)),
    });
  };
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted-foreground">The homepage renders these sections from top to bottom. Hide a section, move it, or open it to change the headline, media, buttons and stages. Changes appear on the public site within a minute.</p>
        <div className="flex gap-2"><a href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink className="h-4 w-4" aria-hidden="true" />Preview</a><button type="button" className="btn btn-gold" onClick={() => setEditing('new')} data-testid="button-new-homepage"><Plus className="h-4 w-4" aria-hidden="true" />New section</button></div>
      </div>
      {err && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{err}</p>}
      {q.isLoading ? <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? <EmptyState icon={Layers} title="No homepage sections yet" body="Create the hero section first, then add the sections that follow." /> : (
        <ol className="space-y-2">
          {list.map((x, i) => {
            const on = x.enabled !== false && x.status === 'published';
            return (
              <li key={x.id} className={cn('card-s flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4', !on && 'opacity-80')} data-testid={`row-homepage-${x.id}`}>
                <div className="flex items-center gap-3 sm:flex-1">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy font-display text-sm text-gold">{i + 1}</span>
                  <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-mist text-sm font-bold text-navy">{has(x.image) ? <img src={mediaUrl(x.image)} alt="" className="h-full w-full object-cover" loading="lazy" /> : initials(x.name)}</div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 text-base font-bold text-navy"><span className="break-words">{x.name}</span>{x.featured && <Star className="h-4 w-4 fill-gold text-gold" aria-label="Featured" />}</p>
                    <p className="text-xs text-muted-foreground">/{x.slug} · {(x.items || []).length} items</p>
                    <div className="mt-1 flex flex-wrap gap-1.5"><span className={cn('chip', on ? 'chip-ok' : 'chip-warn')}>{on ? 'Visible' : x.status !== 'published' ? x.status : 'Hidden'}</span>{has(x.ctaLabel) && <span className="chip">CTA: {x.ctaLabel}</span>}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-outline btn-sm" aria-label={`Move ${x.name} up`} disabled={i === 0 || !!busy} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" className="btn btn-outline btn-sm" aria-label={`Move ${x.name} down`} disabled={i === list.length - 1 || !!busy} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => save(x, { enabled: x.enabled === false, status: x.enabled === false ? 'published' : x.status }, 'toggle')} data-testid={`button-toggle-${x.id}`}>{busy === `toggle-${x.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : x.enabled === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{x.enabled === false ? 'Enable' : 'Disable'}</button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => save(x, { featured: !x.featured }, 'feat')}><Star className="h-4 w-4" aria-hidden="true" />{x.featured ? 'Unfeature' : 'Feature'}</button>
                  <button type="button" className="btn btn-navy btn-sm" onClick={() => setEditing(x)} data-testid={`button-edit-${x.id}`}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => { setBusy(`a-${x.id}`); archive.mutate({ kind: 'homepage', id: x.id }, { onSuccess: () => invalidateAll(qc), onError: (e) => setErr(errMsg(e)), onSettled: () => setBusy(null) }); }}><Archive className="h-4 w-4" aria-hidden="true" />Archive</button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {archived.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg text-navy">Archived sections</h2>
          <ul className="space-y-2">
            {archived.map((x) => (
              <li key={x.id} className="card-s flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4" data-testid={`row-homepage-archived-${x.id}`}>
                <div className="min-w-0 flex-1"><p className="font-semibold text-navy">{x.name}</p><p className="text-xs text-muted-foreground">/{x.slug} · Archived</p></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-navy btn-sm" disabled={!!busy} onClick={() => setEditing(x)}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => save(x, { status: 'draft', enabled: false }, 'restore')}><RotateCcw className="h-4 w-4" aria-hidden="true" />Restore as draft</button>
                  <button type="button" className="btn btn-outline btn-sm text-destructive" disabled={permanentDelete.isPending} onClick={() => { setDeleteConfirm(x); setDeleteErr(''); }}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete permanently</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing === 'new' ? 'New homepage section' : 'Edit homepage section'} wide>
        {editing && <EditorForm key={editing === 'new' ? 'new' : editing.id} kind="homepage" cfg={cfg} item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!deleteConfirm} onOpenChange={(o) => { if (!o && !permanentDelete.isPending) setDeleteConfirm(null); }} title="Permanently delete this section?">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This will permanently delete “{deleteConfirm?.name}” from the CMS and cannot be undone. Uploaded files in storage are not removed.</p>
          {deleteErr && <p className="form-alert" role="alert">{deleteErr}</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" disabled={permanentDelete.isPending} onClick={() => setDeleteConfirm(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={permanentDelete.isPending} onClick={deleteSection}>{permanentDelete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Delete permanently</button></div>
        </div>
      </Modal>
    </div>
  );
}
