import { useEffect, useState } from 'react';
const KEY = '4pl-compare';
const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; } };
const write = (n) => { try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } window.dispatchEvent(new Event('compare-change')); };
export function useCompare() {
  const [ids, setIds] = useState(read);
  useEffect(() => {
    const f = () => setIds(read());
    window.addEventListener('compare-change', f);
    return () => window.removeEventListener('compare-change', f);
  }, []);
  return {
    ids,
    has: (s) => ids.includes(s),
    toggle: (s) => { if (ids.includes(s)) { write(ids.filter((x) => x !== s)); return true; } if (ids.length >= 3) return false; write([...ids, s]); return true; },
    remove: (s) => write(ids.filter((x) => x !== s)),
    clear: () => write([]),
  };
}
