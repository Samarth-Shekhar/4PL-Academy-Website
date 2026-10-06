import { Mail, MapPin, Phone } from 'lucide-react';
import { telHref } from '@/lib/settings';
import { has } from '@/lib/format';
import { RichText } from '@/components/RichText';
import { LeadForm } from '@/components/LeadForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { OfficeLocationMap } from '@/components/OfficeLocationMap';

const link = 'min-w-0 text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold';

export default function ContactPage({ c, ctx, careers, st, page }) {
  return (
    <div className="container-x py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: c.eyebrow }]} />
      <div className="mt-6 grid gap-8 overflow-hidden rounded-[2rem] border border-navy/10 bg-white p-4 shadow-[0_24px_60px_-40px_hsl(var(--brand-navy)/.5)] sm:p-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-8">
        <div className="min-w-0 border-t-4 border-gold px-2 py-4 sm:px-4 lg:py-6">
          <span className="mt-4 grid h-12 w-12 place-items-center rounded-xl bg-gold text-navy shadow-lg" aria-hidden="true"><Mail className="h-5 w-5" /></span>
          <p className="eyebrow mt-6">{c.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-5xl">{c.title}</h1>
          <p className="mt-5 max-w-md text-muted-foreground">{c.body}</p>
          <div className="mt-8 space-y-4" data-testid="block-contact-details">
            {st.offices.length ? st.offices.map((o) => (
              <section key={o.id} aria-label={o.name} className="rounded-2xl border border-navy/10 bg-gold-soft/50 p-4">
                <h2 className="text-base font-bold text-navy">{o.name}</h2>
                <ul className="mt-2 space-y-2 text-sm text-navy/85">
                  {has(o.address) && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><span className="min-w-0 whitespace-pre-line break-words">{o.address}</span></li>}
                  {has(o.email) && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><a href={`mailto:${o.email}`} className={`${link} break-all`}>{o.email}</a></li>}
                  {o.phones.map((ph) => <li key={ph} className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><a href={telHref(ph)} className={link}>{ph}</a></li>)}
                </ul>
              </section>
            )) : <p className="text-sm text-muted-foreground">{st.isLoading ? 'Loading contact details' : 'Contact details are being verified. Please use the form and our team will reply.'}</p>}
          </div>
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="rounded-[1.5rem] border border-navy/10 border-t-4 border-t-gold bg-mist/60 p-5 sm:p-8">
            <div className="[&_.label]:text-navy [&_input[type=checkbox]]:accent-[hsl(221_76%_17%)]">
              <LeadForm key={JSON.stringify(ctx)} category={c.cat} idPrefix="contact" submitLabel={c.label} compact contactFields {...ctx} />
            </div>
          </div>
          <p className="mt-4 px-2 text-xs text-muted-foreground">{careers ? 'This is a general enquiry to the team, not a job application.' : 'Admission, training and placement support is provided. Admission, jobs and salaries are never guaranteed.'}</p>
        </div>
        <div className="min-w-0 px-0 pb-2 sm:px-2 lg:col-start-1">
          <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white p-1.5 text-foreground"><OfficeLocationMap /></div>
          {page && has(page.description) && <div className="mt-8 rounded-2xl bg-surface p-5 text-foreground"><RichText text={page.description} /></div>}
        </div>
      </div>
    </div>
  );
}
