import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { ACCEPT, uploadFile } from '@/lib/upload';
import { mediaUrl } from '@/lib/home';
import { has } from '@/lib/format';

const isVideo = (u) => /\.(mp4|webm)(\?|$)/i.test(u || '');
export function UploadField({ id, accept = 'image', mediaType, value, onChange, onUploaded, onBusyChange, invalid, register }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setBusy(true); setErr(''); onBusyChange?.(true);
    try { const path = await uploadFile(file, accept); onChange(path); await onUploaded?.(path, file); } catch (x) { setErr(x.message || 'Upload failed.'); } finally { setBusy(false); onBusyChange?.(false); }
  };
  const v = value || '';
  const video = accept === 'media' && (mediaType === 'video' || isVideo(v));
  return (
    <div>
      <div className="flex gap-2">
        <input id={id} className="input" placeholder="Paste an approved URL or upload a file" aria-invalid={invalid} {...register} />
        <button type="button" className="btn btn-outline shrink-0" onClick={() => ref.current?.click()} disabled={busy} aria-label={busy ? 'Uploading file' : accept === 'media' ? 'Upload image or video' : 'Upload image'} data-testid={`button-upload-${id}`}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}<span className="hidden sm:inline">{busy ? 'Uploading' : 'Upload'}</span></button>
        <input ref={ref} type="file" accept={ACCEPT[accept]} className="sr-only" tabIndex={-1} onChange={pick} aria-label="Choose a file to upload" />
      </div>
      {has(v) && !video && <img key={v} src={mediaUrl(v)} alt="" className="mt-2 h-16 w-auto max-w-full rounded border border-line object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      {has(v) && video && <p className="hint">Video file attached.</p>}
      {err && <p className="field-err" role="alert">{err}</p>}
    </div>
  );
}
