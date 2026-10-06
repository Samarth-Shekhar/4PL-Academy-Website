import { usePublicList } from './api';
import { has } from './format';
// Returns every published contact office from settings records (e.g. contact-india, contact-uk). No literals.
export function useContactSettings() {
  const q = usePublicList('settings', undefined, { staleTime: 120000, retry: 0 });
  const list = Array.isArray(q.data) ? q.data : [];
  const offices = list.filter((s) => /contact/i.test(s.slug || '') && (has(s.email) || has(s.phone) || has(s.location)))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((s) => ({ id: s.id, name: s.name, email: s.email, address: s.location, website: s.websiteUrl || '', phones: String(s.phone || '').split(/[\/;,|]/).map((x) => x.trim()).filter((x) => /\d{6,}/.test(x)) }));
  const first = (k) => { for (const o of offices) { const v = k === 'phone' ? o.phones[0] : o[k]; if (has(v)) return v; } return ''; };
  return { isLoading: q.isLoading, isError: q.isError, offices, email: first('email'), phone: first('phone'), address: first('address') };
}
export const telHref = (p) => `tel:${String(p).replace(/[^0-9+]/g, '')}`;
