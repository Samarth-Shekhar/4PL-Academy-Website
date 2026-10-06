import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export function FaqList({ faqs, title = 'Frequently asked questions', defaultOpen = false }) {
  if (!faqs || !faqs.length) return null;
  return (
    <section className="mt-10">
      {title && <><h2 className="text-2xl text-navy sm:text-3xl">{title}</h2><div className="gold-rule mt-3 mb-5" /></>}
      <Accordion.Root type="single" collapsible defaultValue={defaultOpen ? 'q0' : undefined} className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
        {faqs.map((f, i) => (
          <Accordion.Item key={i} value={`q${i}`}>
            <Accordion.Header>
              <Accordion.Trigger className="group flex min-h-[3.25rem] w-full items-center justify-between gap-4 px-4 py-3.5 text-left font-semibold text-navy hover:bg-mist/60">
                <span>{f.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-gold-deep transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0">
              <p className="whitespace-pre-line px-4 pb-4 text-[0.95rem] leading-relaxed text-foreground/80">{f.answer}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
