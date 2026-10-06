import { Check } from 'lucide-react';
import { paragraphs } from '@/lib/format';

export function RichText({ text, className = '' }) {
  const ps = paragraphs(text);
  if (!ps.length) return null;
  return (
    <div className={`prose-4pl ${className}`}>
      {ps.map((p, i) => {
        if (/^#{2,3} /.test(p)) return <h3 key={i}>{p.replace(/^#{2,3} /, '')}</h3>;
        const list = p.split('\n').filter((line) => line.trim());
        if (list.length && list.every((line) => line.trim().startsWith('- '))) {
          return <ul key={i} className="list-disc space-y-2 pl-5">{list.map((line, j) => <li key={j}>{line.trim().slice(2)}</li>)}</ul>;
        }
        return <p key={i} className="whitespace-pre-line">{p}</p>;
      })}
    </div>
  );
}
export function ListBlock({ title, items, numbered, columns }) {
  if (!items || !items.length) return null;
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-2xl text-navy sm:text-3xl">{title}</h2>
      <div className="gold-rule mt-3" />
      <ul className={`mt-5 grid gap-3 ${columns ? 'sm:grid-cols-2' : ''}`}>
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 rounded-md border border-line bg-card p-3.5 text-[0.95rem] leading-relaxed">
            {numbered ? <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-gold">{i + 1}</span> : <Check className="mt-1 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />}
            <span className="min-w-0 break-words">{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
