import { Mail, MapPin, Phone } from 'lucide-react';
import { telHref } from '@/lib/settings';
import { has } from '@/lib/format';
import { RichText } from '@/components/RichText';
import { LeadForm } from '@/components/LeadForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { OfficeLocationMap } from '@/components/OfficeLocationMap';

const grid = { backgroundImage: 'linear-gradient(hsl(0 0% 100% / .05) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / .05) 1px, transparent 1px)', backgroundSize: '32px 32px', WebkitMaskImage: 'radial-gradient(ellipse at top right, #000, transparent 70%)', maskImage: 'radial-gradient(ellipse at top right, #000, transparent 70%)' };

export default function ContactPage({ c, ctx, careers, st, page }) {
  return (
    <div className="container-x py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: c.eyebrow }]} />
      <div className="navy-surface on-navy mt-6 grid gap-10 rounded-[2rem] p-4 sm:p-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-8">
        <div className="min-w-0 px-2 py-4 sm:px-4 lg:py-6">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-navy shadow-lg" aria-hidden="true"><Mail className="h-5 w-5" /></span>
          <p className="eyebrow mt-6 !text-gold">{c.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">{c.title}</h1>
          <p className="mt-5 max-w-md text-white/75">{c.body}</p>
          <div className="mt-8 space-y-6" data-testid="block-contact-details">
            {st.offices.length ? st.offices.map((o) => (
              <section key={o.id} aria-label={o.name}>
                <h2 className="text-base font-bold text-gold">{o.name}</h2>
                <ul className="mt-2 space-y-2 text-sm text-white/85">
                  {has(o.address) && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /><span className="min-w-0 whitespace-pre-line break-words">{o.address}</span></li>}
                  {has(o.email) && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /><a href={`mailto:${o.email}`} className="min-w-0 break-all underline decoration-gold underline-offset-4 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">{o.email}</a></li>}
                  {o.phones.map((ph) => <li key={ph} className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /><a href={telHref(ph)} className="underline decoration-gold underline-offset-4 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">{ph}</a></li>)}
                </ul>
              </section>
            )) : <p className="text-sm text-white/70">{st.isLoading ? 'Loading contact details' : 'Contact details are being verified. Please use the form and our team will reply.'}</p>}
          </div>
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[hsl(221_76%_9%)] p-5 ring-1 ring-white/10 sm:p-8">
            <div className="pointer-events-none absolute inset-0" style={grid} aria-hidden="true" />
            <div className="relative [&_.label]:text-white [&_label]:text-white/90 [&_.text-muted-foreground]:text-white/70 [&_.field-err]:text-red-200 [&_.input]:border-white/15 [&_.input]:bg-white/10 [&_.input]:text-white [&_.input]:placeholder:text-white/50 [&_.input:focus]:border-gold [&_.input:focus]:outline-none [&_.input:focus]:ring-2 [&_.input:focus]:ring-gold [&_input[type=checkbox]]:accent-gold">
              <LeadForm key={JSON.stringify(ctx)} category={c.cat} idPrefix="contact" submitLabel={c.label} compact {...ctx} />
            </div>
          </div>
          <p className="mt-4 px-2 text-xs text-white/65">{careers ? 'This is a general enquiry to the team, not a job application.' : 'Admission, training and placement support is provided. Admission, jobs and salaries are never guaranteed.'}</p>
        </div>
        <div className="min-w-0 px-2 pb-4 sm:px-4 lg:col-start-1">
          <div className="overflow-hidden rounded-2xl bg-surface p-1.5 text-foreground"><OfficeLocationMap /></div>
          {page && has(page.description) && <div className="mt-8 rounded-2xl bg-surface p-5 text-foreground"><RichText text={page.description} /></div>}
        </div>
      </div>
    </div>
  );
}
