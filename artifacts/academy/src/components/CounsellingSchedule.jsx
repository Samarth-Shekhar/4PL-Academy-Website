import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BrandSelect } from './BrandSelect';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');
const timeLabel = (value) => {
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? 'AM' : 'PM'}`;
};
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const value = `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`;
  return { value, label: timeLabel(value) };
});
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIn = (tz) => {
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  catch { return new Date().toISOString().slice(0, 10); }
};
const parse = (v) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null; };

export function CounsellingSchedule({ date = '', time = '', onDateChange, onTimeChange, dateError, timeError, idPrefix = 'book', timeZone = 'Asia/Kolkata' }) {
  const today = todayIn(timeZone);
  const t = parse(today);
  const sel = parse(date);
  const [view, setView] = useState(() => ({ y: (sel || t).y, m: (sel || t).m }));
  const grid = useRef(null);
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const lead = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const cells = useMemo(() => [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)], [lead, days]);
  const atMin = view.y === t.y && view.m === t.m;
  const shift = (n) => setView(({ y, m }) => { const x = m + n; return { y: y + Math.floor(x / 12), m: ((x % 12) + 12) % 12 }; });
  const onKey = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    const btns = [...grid.current.querySelectorAll('button:not([disabled])')];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    const next = btns[Math.min(btns.length - 1, Math.max(0, i + step))];
    if (next) { e.preventDefault(); next.focus(); }
  };
  const id = (n) => `${idPrefix}-${n}`;
  const timeOptions = time && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) && !TIME_OPTIONS.some(o => o.value === time)
    ? [...TIME_OPTIONS, { value: time, label: timeLabel(time) }].sort((a, b) => a.value.localeCompare(b.value))
    : TIME_OPTIONS;
  return (
    <fieldset className="min-w-0 rounded-[1.25rem] border border-gold/50 bg-gold-soft/50 p-3" aria-describedby={id('sched-note')}>
      <legend className="px-2 text-sm font-bold text-navy">Preferred date and time</legend>
      <p id={id('sched-note')} className="mb-2 text-xs text-navy/75">Preferred appointment only—our team confirms availability. Times are in IST (UTC+05:30).</p>
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,.85fr)]">
      <div className="min-w-0">
      <div className="mx-auto max-w-sm rounded-xl bg-white p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button type="button" onClick={() => shift(-1)} disabled={atMin} aria-label="Previous month" data-testid={`button-${idPrefix}-prev-month`} className="grid h-11 w-11 place-items-center rounded-full border border-navy/15 text-navy hover:bg-gold hover:text-navy disabled:opacity-40 disabled:hover:bg-transparent"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
          <p id={id('month')} aria-live="polite" className="text-center font-display text-base font-extrabold text-navy sm:text-lg">{MONTHS[view.m]} {view.y}</p>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" data-testid={`button-${idPrefix}-next-month`} className="grid h-11 w-11 place-items-center rounded-full border border-navy/15 text-navy hover:bg-gold hover:text-navy"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[0.65rem] font-bold uppercase text-navy/60 sm:text-xs" aria-hidden="true">{DAYS.map((d) => <span key={d} className="py-1">{d.slice(0, 3)}</span>)}</div>
        <div ref={grid} role="group" aria-labelledby={id('month')} aria-describedby={dateError ? id('date-err') : undefined} onKeyDown={onKey} className="grid grid-cols-7 gap-0.5">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} aria-hidden="true" />;
            const v = iso(view.y, view.m, d);
            const past = v < today;
            const on = v === date;
            const name = `${DAYS[(lead + d - 1) % 7]}, ${d} ${MONTHS[view.m]} ${view.y}`;
            return <button key={v} type="button" disabled={past} aria-pressed={on} aria-label={name + (v === today ? ' (today)' : '')} data-testid={`button-${idPrefix}-day-${v}`} onClick={() => onDateChange?.(v)} className={cn('grid h-10 place-items-center rounded-full text-sm font-semibold transition-colors', on ? 'bg-gold text-navy shadow-md' : past ? 'cursor-not-allowed text-navy/25' : 'text-navy hover:bg-gold-soft', v === today && !on && 'ring-1 ring-gold-deep')}>{d}</button>;
          })}
        </div>
      </div>
      {dateError && <p id={id('date-err')} className="field-err" role="alert">{dateError}</p>}
      </div>
      <div className="min-w-0 space-y-3 self-start rounded-xl bg-white/70 p-3">
        <p className="text-sm font-semibold text-navy" aria-live="polite">{sel ? `${DAYS[new Date(Date.UTC(sel.y, sel.m, sel.d)).getUTCDay()]}, ${sel.d} ${MONTHS[sel.m]} ${sel.y}` : 'Choose your preferred date'}</p>
        <div role="group" aria-describedby={timeError ? id('time-err') : undefined}>
        <label className="label flex items-center gap-1.5" htmlFor={id('time')}><Clock className="h-3.5 w-3.5 text-gold-deep" aria-hidden="true" />Preferred time</label>
        <BrandSelect id={id('time')} value={time} onChange={onTimeChange} options={[{ value: '', label: 'Select a time' }, ...timeOptions]} placeholder="Select a time" invalid={!!timeError} aria-label="Preferred time in India Standard Time" data-testid={`input-${idPrefix}-time`} />
        {timeError && <p id={id('time-err')} className="field-err" role="alert">{timeError}</p>}
        </div>
        <p className="text-xs text-navy/70">India Standard Time · UTC+05:30</p>
      </div>
      </div>
    </fieldset>
  );
}

export default CounsellingSchedule;
