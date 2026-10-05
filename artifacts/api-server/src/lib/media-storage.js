// Small native-JavaScript App Storage adapter. No service credentials enter the browser.
// A portable deployment can replace the signer with a compatible private signing service.
const unavailable = () => Object.assign(new Error('Media upload storage is not configured.'), { status:503 });
export function storageLocation(id) {
  const root = process.env.PRIVATE_OBJECT_DIR;
  if (!root) throw unavailable();
  const parts = root.replace(/^\/|\/$/g, '').split('/');
  if (parts.length < 2) throw unavailable();
  return { bucketName:parts[0], objectName:[...parts.slice(1),'academy',id].join('/') };
}
export async function signMediaObject(id, method) {
  const {bucketName, objectName} = storageLocation(id);
  const endpoint = process.env.STORAGE_SIGNER_URL || 'http://127.0.0.1:1106/object-storage/signed-object-url';
  let result;
  try {
    const response = await fetch(endpoint, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({bucket_name:bucketName, object_name:objectName, method, expires_at:new Date(Date.now()+900000).toISOString()}),
      signal:AbortSignal.timeout(15000),
    });
    if (!response.ok) throw unavailable();
    result = await response.json();
  } catch { throw unavailable(); }
  if (typeof result.signed_url !== 'string' || !result.signed_url.startsWith('https://')) throw unavailable();
  return result.signed_url;
}
