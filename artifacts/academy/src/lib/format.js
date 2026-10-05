export const TBV = 'Information to be verified';
export const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
export const val = (v) => (has(v) ? String(v) : TBV);
export const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;
export const lines = (v) => (Array.isArray(v) ? v.filter(has) : []);
export const paragraphs = (t) => (has(t) ? String(t).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean) : []);
export const initials = (n = '') => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '4P';
export const fmtDate = (d) => {
  if (!d) return '';
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? String(d) : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
export function parseFee(s) {
  if (!has(s)) return null;
  const str = String(s).toLowerCase().replace(/,/g, '');
  const m = str.match(/(\d+(\.\d+)?)/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (/lakh|lac|\bl\b/.test(str)) n *= 100000;
  return n;
}
export const FEE_RANGES = [
  { id: 'lt3', label: 'Under 3 lakh', test: (n) => n < 300000 },
  { id: '3-6', label: '3 to 6 lakh', test: (n) => n >= 300000 && n < 600000 },
  { id: '6-10', label: '6 to 10 lakh', test: (n) => n >= 600000 && n < 1000000 },
  { id: 'gt10', label: 'Above 10 lakh', test: (n) => n >= 1000000 },
];
export const uniq = (arr) => [...new Set(arr.filter(has).map((s) => String(s).trim()))].sort((a, b) => a.localeCompare(b));
export const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
export const programLevel = (p) => {
  const t = `${p.degreeLevel || ''} ${p.degree || ''} ${p.name || ''}`.toLowerCase();
  if (/post|master|mba|pgdm|m\.?sc|m\.?com|\bm\.?a\b/.test(t)) return 'pg';
  if (/under|bachelor|bba|b\.?com|b\.?sc|bca|\bb\.?a\b|b\.?tech/.test(t)) return 'ug';
  return '';
};
