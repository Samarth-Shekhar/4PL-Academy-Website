import { useEffect, useRef, useState } from 'react';
import { usePublicList } from './api';
import { has, asset } from './format';

export const REFRESH = 45000;
export const mediaUrl = (u) => {
  if (!has(u)) return '';
  const s = String(u).trim();
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  if (s.startsWith('/objects/')) return `${import.meta.env.BASE_URL}api/storage${s}`;
  return asset(s);
};
export function useMedia() {
  const q = usePublicList('media', undefined, { refetchInterval: REFRESH });
  const list = (q.data || []).filter((m) => m.verified === true && has(m.url) && m.status !== 'archived').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { ...q, list };
}
export const bySection = (list, s) => list.filter((m) => String(m.section || '').toLowerCase() === s);
export function useVerified(kind) {
  const q = usePublicList(kind, undefined, { refetchInterval: REFRESH });
  const list = (q.data || []).filter((x) => x.verified === true).sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { ...q, list };
}
export function useMatch(query) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => { const mq = window.matchMedia(query); const f = () => setM(mq.matches); f(); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, [query]);
  return m;
}
export function useInView(margin = '0px') {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return undefined; const o = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin }); o.observe(el); return () => o.disconnect(); }, [margin]);
  return [ref, v];
}
export function useTabVisible() {
  const [v, setV] = useState(true);
  useEffect(() => { const f = () => setV(!document.hidden); document.addEventListener('visibilitychange', f); return () => document.removeEventListener('visibilitychange', f); }, []);
  return v;
}
export const saveData = () => typeof navigator !== 'undefined' && !!navigator.connection?.saveData;
export const REL_LABEL = { Partner: 'Partner', 'Hiring Partner': 'Hiring partner', 'Training Partner': 'Training partner', 'Corporate Client': 'Corporate client', 'Industry Association': 'Industry association', 'Technology Partner': 'Technology partner', 'Featured Company': 'Featured company', Other: 'Associated company' };
