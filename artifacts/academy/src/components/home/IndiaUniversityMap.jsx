import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'wouter';
import { X } from 'lucide-react';
import { asset } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useState, useEffect, useId } from 'react';
import { useIndiaOffice } from '@/components/OfficeLocationMap';

export const W = 600; export const H = 640;
export const project = (lat, lon) => ({ x: ((lon - 68) / 30) * W, y: ((38 - lat) / 32) * H });

export function IndiaUniversityMap({ regions, selected, onSelect, activeUni, onUni, programsOf, partnerMode }) {
  const reduce = useReducedMotion();
  const mapId = useId().replace(/:/g, '');
  const office = useIndiaOffice();
  const [officeOpen, setOfficeOpen] = useState(false);
  useEffect(() => { setOfficeOpen(false); }, [selected]);
  useEffect(() => { if (activeUni) setOfficeOpen(false); }, [activeUni]);
  const officePoint = office && Number.isFinite(office.latitude) && Number.isFinite(office.longitude) ? project(office.latitude, office.longitude) : null;
  const sel = regions.find((r) => r.key === selected);
  const au = activeUni && sel?.unis.find((u) => u.id === activeUni);
  const pop = au ? au.pt : null;
  const left = pop ? Math.min(Math.max((pop.x / W) * 100, 24), 76) : 50;
  return (
    <div className="relative mx-auto w-full max-w-[34rem] overflow-hidden rounded-3xl bg-navy" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="group" aria-label={partnerMode ? 'Map of verified partner universities in India' : 'Map of university directory locations in India, city centre positions'}>
        <defs>
          <radialGradient id={`${mapId}-glow`} cx="50%" cy="45%" r="65%"><stop offset="0" stopColor="hsl(219 45% 43%)" stopOpacity=".55" /><stop offset="1" stopColor="hsl(221 76% 17%)" stopOpacity="0" /></radialGradient>
          <pattern id={`${mapId}-mesh`} width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#75a3d2" strokeOpacity=".14" strokeWidth=".7" /><circle cx="0" cy="0" r="1.2" fill="#75a3d2" opacity=".25" /></pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${mapId}-glow)`} />
        <rect width={W} height={H} fill={`url(#${mapId}-mesh)`} aria-hidden="true" />
        <image href={asset('images/india-map.svg')} x="0" y="0" width={W} height={H} preserveAspectRatio="none" opacity=".95" />
        <text x="26" y="35" fill="#e2b744" fontSize="12" fontWeight="700" letterSpacing="2">UNIVERSITY NETWORK</text>
        <text x="26" y="58" fill="white" fontSize="13">{regions.reduce((n, r) => n + r.unis.length, 0)} universities · {regions.length} regions</text>
        {officePoint && regions.map((r) => <path key={`link-${r.key}`} d={`M${officePoint.x} ${officePoint.y} H${r.pt.x + 24} V${r.pt.y} H${r.pt.x}`} fill="none" stroke="#e2b744" strokeWidth="1.2" strokeDasharray="4 5" opacity=".45" aria-hidden="true" />)}
        <path d="M26 555v38h45m-24-17h25v-20h28 M540 94h32v40m-18-20v36h-24" fill="none" stroke="#e2b744" strokeOpacity=".35" strokeWidth="1.2" aria-hidden="true" />
        {sel && regions.filter((r) => r.key !== sel.key).map((r) => <line key={r.key} x1={sel.pt.x} y1={sel.pt.y} x2={r.pt.x} y2={r.pt.y} stroke="hsl(40 64% 50%)" strokeOpacity=".55" strokeWidth="1.4" className={reduce ? '' : 'map-line'} />)}
        {regions.map((r, i) => {
          const on = r.key === selected;
          const rad = 11 + Math.min(r.unis.length * 2, 10);
          return (
            <motion.g key={r.key} initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 220, damping: 18 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <g className="map-marker" role="button" tabIndex={0} aria-label={`${r.label}: ${r.unis.length} ${r.unis.length === 1 ? 'university' : 'universities'}. ${on ? 'Selected' : 'Select to view'}`} aria-pressed={on} onClick={() => onSelect(on ? null : r.key)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(on ? null : r.key); } }}>
                {!reduce && <circle cx={r.pt.x} cy={r.pt.y} r={rad} fill="hsl(40 64% 50%)" className="map-ping" opacity=".5" />}
                <circle className="ring" cx={r.pt.x} cy={r.pt.y} r={rad} fill={on ? 'hsl(40 72% 62%)' : 'hsl(40 64% 50%)'} stroke="hsl(221 76% 17%)" strokeWidth="2.5" />
                <text x={r.pt.x} y={r.pt.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(221 76% 17%)" style={{ pointerEvents: 'none' }}>{r.unis.length}</text>
                <circle cx={r.pt.x} cy={r.pt.y} r={Math.max(rad + 8, 26)} fill="transparent" />
              </g>
              {!on && <text x={r.pt.x} y={r.pt.y - rad - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="hsl(40 30% 97%)" stroke="hsl(221 76% 17%)" strokeWidth="3" paintOrder="stroke" style={{ pointerEvents: 'none' }}>{r.label}</text>}
            </motion.g>
          );
        })}
        {sel && sel.unis.map((u) => (
          <g key={u.id} className="map-marker" role="button" tabIndex={0} aria-label={`${u.name}, ${u.city || sel.label}`} aria-pressed={activeUni === u.id} onClick={() => onUni(u.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUni(u.id); } }}>
            <circle className="ring" cx={u.pt.x} cy={u.pt.y} r={activeUni === u.id ? 9 : 7} fill={u.partnershipVerified ? 'hsl(40 72% 62%)' : 'hsl(40 30% 97%)'} stroke="hsl(40 64% 50%)" strokeWidth="3" />
            <circle cx={u.pt.x} cy={u.pt.y} r="18" fill="transparent" />
          </g>
        ))}
        {officePoint && (
          <g className="map-marker" role="button" tabIndex={0} aria-label="4PL Academy Noida office, approximate location. View contact information" aria-pressed={officeOpen}
            onClick={() => { setOfficeOpen(v => !v); onUni(null); }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOfficeOpen(v => !v); onUni(null); } }}>
            <title>4PL Academy, Noida — approximate office area</title>
            <line x1={officePoint.x} y1={officePoint.y} x2={officePoint.x + 48} y2={officePoint.y - 44} stroke="hsl(40 64% 50%)" strokeWidth="2" />
            <circle cx={officePoint.x} cy={officePoint.y} r="4" fill="white" />
            <path d={`M${officePoint.x + 48},${officePoint.y - 62} l18,18 l-18,18 l-18,-18 Z`} fill="hsl(40 64% 50%)" stroke="white" strokeWidth="2" />
            <text x={officePoint.x + 48} y={officePoint.y - 40} textAnchor="middle" fill="hsl(221 76% 17%)" fontSize="10" fontWeight="800" pointerEvents="none">4PL</text>
            <text x={officePoint.x + 48} y={officePoint.y - 69} textAnchor="middle" fill="white" fontSize="12" fontWeight="700" stroke="hsl(221 76% 17%)" strokeWidth="3" paintOrder="stroke" pointerEvents="none">4PL Academy · Noida</text>
            <circle cx={officePoint.x + 48} cy={officePoint.y - 44} r="26" fill="transparent" />
          </g>
        )}
      </svg>
      {officeOpen && office && (
        <div className="absolute inset-x-2 bottom-2 z-20 rounded-xl bg-surface p-4 text-navy shadow-xl" role="region" aria-label="4PL Academy Noida office details">
          <button type="button" onClick={() => setOfficeOpen(false)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center" aria-label="Close office details"><X className="h-4 w-4" /></button>
          <h4 className="pr-8 text-lg">4PL Academy</h4><p className="mt-1 whitespace-pre-line text-xs">{office.location}</p>
          <Link href="/contact" className="btn btn-navy btn-sm mt-3">View Contact</Link>
        </div>
      )}
      {au && (
        <div className={cn('absolute inset-x-2 bottom-2 z-10 rounded-lg bg-surface p-4 text-navy shadow-xl sm:inset-x-auto sm:w-64 sm:-translate-x-1/2 sm:-translate-y-full')} style={{ ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { left: `${left}%`, top: `calc(${(pop.y / H) * 100}% - 14px)` } : {}) }} role="dialog" aria-label={au.name}>
          <button type="button" className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded text-navy hover:bg-mist" onClick={() => onUni(null)} aria-label="Close"><X className="h-4 w-4" /></button>
          <h4 className="pr-6 font-display text-base leading-snug">{au.name}</h4>
          <p className="text-xs text-muted-foreground">{[au.city, au.state].filter(Boolean).join(', ')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{au.coordinateAccuracy === 'campus' ? 'Campus coordinates supplied by the administrator.' : 'Approximate city-centre location, not a campus address.'}</p>
          <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-wider text-gold-deep">Available programs</p>
          <ul className="mt-1 space-y-0.5 text-sm">{programsOf(au).slice(0, 3).map((p) => <li key={p.id}><Link href={`/programs/${p.slug}`} className="font-semibold underline-offset-4 hover:underline">{p.name}</Link></li>)}{!programsOf(au).length && <li className="text-muted-foreground">None linked yet</li>}</ul>
          <Link href={`/universities/${au.slug}`} className="btn btn-navy btn-sm mt-3 w-full">View University</Link>
        </div>
      )}
    </div>
  );
}
