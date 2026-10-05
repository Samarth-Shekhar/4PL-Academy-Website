import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Modal({ open, onOpenChange, title, description, children, side = 'center', wide, className }) {
  const pos = {
    center: 'left-1/2 top-1/2 w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg max-h-[92dvh]',
    bottom: 'inset-x-0 bottom-0 rounded-t-2xl max-h-[88dvh] data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
    right: 'right-0 top-0 h-[100dvh] w-[min(22rem,92vw)] data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  }[side];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn('fixed z-[61] flex flex-col overflow-hidden bg-card shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200', pos, side === 'center' && (wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'), className)}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <Dialog.Title className="font-display text-xl text-navy">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-navy hover:bg-mist" aria-label="Close"><X className="h-5 w-5" /></Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
