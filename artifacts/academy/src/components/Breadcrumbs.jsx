import { useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { setJsonLd } from '@/lib/seo';
import { cn } from '@/lib/cn';

export function Breadcrumbs({ items, light }) {
  const key = JSON.stringify(items);
  useEffect(() => {
    const base = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '');
    setJsonLd('ld-breadcrumb', {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: JSON.parse(key).map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, ...(it.href ? { item: base + it.href } : {}) })),
    });
    return () => setJsonLd('ld-breadcrumb', null);
  }, [key]);
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn('flex flex-wrap items-center gap-1 text-xs sm:text-sm', light ? 'text-surface/70' : 'text-muted-foreground')}>
        {items.map((it, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1">
            {it.href && i < items.length - 1 ? <Link href={it.href} className="underline-offset-4 hover:underline">{it.label}</Link> : <span aria-current="page" className={cn('truncate max-w-[60vw]', light ? 'text-gold' : 'text-navy font-semibold')}>{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
