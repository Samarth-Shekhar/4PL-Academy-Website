const IMG = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const VID = ['video/mp4', 'video/webm'];
export const ACCEPT = { image: IMG.join(','), media: [...IMG, ...VID].join(',') };
export async function uploadFile(file, kind = 'media') {
  const ok = kind === 'image' ? IMG : [...IMG, ...VID];
  if (!ok.includes(file.type)) throw new Error(`Unsupported file type (${file.type || 'unknown'}). Allowed: ${ok.map((m) => m.split('/')[1]).join(', ')}.`);
  const isImg = IMG.includes(file.type);
  if (file.size > (isImg ? 10 : 25) * 1024 * 1024) throw new Error(`${isImg ? 'Images' : 'Files'} must be under ${isImg ? 10 : 25} MB.`);
  const base = import.meta.env.BASE_URL;
  let r;
  try { r = await fetch(`${base}api/storage/uploads/request-url`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }) }); } catch { throw new Error('Could not reach the upload service. Check your connection.'); }
  if (r.status === 401 || r.status === 403) throw new Error('Upload refused: you are not signed in as an administrator.');
  if (!r.ok) throw new Error(`Upload could not start (HTTP ${r.status}).`);
  const { uploadURL, objectPath } = await r.json();
  let put;
  try { put = await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); } catch { throw new Error('The file transfer failed. Nothing was saved.'); }
  if (!put.ok) throw new Error(`The file transfer failed (HTTP ${put.status}). Nothing was saved.`);
  return objectPath;
}
