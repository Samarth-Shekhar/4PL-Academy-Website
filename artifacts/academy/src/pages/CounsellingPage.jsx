import { Link } from 'wouter';
import { CalendarCheck, Clock, MessageSquareText } from 'lucide-react';
import { PageHero } from '@/components/ui-kit';
import { LeadForm } from '@/components/LeadForm';
import { asset } from '@/lib/format';

const steps = [
  [CalendarCheck, 'Pick a preferred date and time', 'Choose what suits you in India Standard Time (IST, UTC+05:30).'],
  [Clock, 'This is a request, not a booking', 'Your slot is not reserved. Our team will confirm availability with you.'],
  [MessageSquareText, 'We get in touch', 'An advisor contacts you to confirm or suggest a nearby time.'],
];

export default function CounsellingPage({ c, ctx }) {
  return (
    <div>
      <PageHero eyebrow={c.eyebrow} title={c.title} body={c.body} crumbs={[{ label: 'Home', href: '/' }, { label: c.eyebrow }]} />
      <div className="container-x py-8 sm:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_.7fr] lg:gap-12">
          <div className="form-surface min-w-0 p-5 sm:p-8">
            <div className="[&_.label]:text-navy">
              <LeadForm key={JSON.stringify(ctx)} category={c.cat} scheduling idPrefix="book" submitLabel={c.label} {...ctx} />
            </div>
          </div>
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-24" aria-label="About your appointment request">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-gold/60 bg-gold-soft p-5 sm:p-6">
              <div aria-hidden="true" className="band-ring" />
              <p className="eyebrow relative">Appointment request</p>
              <h2 className="relative mt-2 font-display text-2xl font-extrabold text-navy">Your preferred time, our confirmation</h2>
              <ol className="relative mt-4 space-y-4">
                {steps.map(([Icon, t, b]) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-gold" aria-hidden="true"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 text-sm text-navy/85"><strong className="block text-navy">{t}</strong>{b}</span>
                  </li>
                ))}
              </ol>
              <p className="relative mt-5 text-sm text-navy/85">Prefer to write to us? <Link href="/contact" className="font-bold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep">Contact Us</Link></p>
            </div>
            <img src={asset('images/ai-human-learning/robotics-project-1280.webp')} alt="" loading="lazy" className="hidden aspect-[4/3] w-full rounded-[1.5rem] border-b-4 border-gold object-cover lg:block" />
          </aside>
        </div>
      </div>
    </div>
  );
}
