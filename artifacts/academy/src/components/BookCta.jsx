import { Link } from 'wouter';
import { CalendarCheck } from 'lucide-react';
import { bookHref } from '@/lib/booking';
import { cn } from '@/lib/cn';

export function BookButton({ ctx, label = 'Book Counselling', className, variant = 'gold', size = 'btn-sm', testid }) {
  return <Link href={bookHref(ctx)} className={cn('btn', `btn-${variant}`, size, className)} data-testid={testid || 'link-book-counselling'}><CalendarCheck className="h-4 w-4" aria-hidden="true" />{label}</Link>;
}
export function StickyBook({ ctx, title }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 shadow-[0_-8px_24px_-12px_hsl(221_76%_17%/.4)] backdrop-blur lg:hidden" data-testid="bar-sticky-book">
      <div className="container-x flex items-center gap-3"><p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{title}</p><BookButton ctx={ctx} size="" className="shrink-0" /></div>
    </div>
  );
}
