import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { telHref } from '@/lib/settings';
import { has } from '@/lib/format';
import { RichText } from '@/components/RichText';
import { LeadForm } from '@/components/LeadForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { OfficeLocationMap } from '@/components/OfficeLocationMap';

const link = 'min-w-0 text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold';

function InfoCard({ icon: Icon, title, testid, children, i = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.section aria-label={title} data-testid={testid} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }} className="group/card min-w-0 rounded-2xl transition-[box-shadow,border-color] duration-300 hover:border-gold motion-safe:hover:-translate-y-1 border border-navy/10 bg-white p-6 text-center shadow-[0_18px_44px_-34px_hsl(var(--brand-navy)/.5)] sm:p-7">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-soft text-gold-deep" aria-hidden="true"><Icon className="h-6 w-6" /></span>
      <h2 className="mt-4 text-lg font-extrabold text-navy">{title}</h2>
      <div className="gold-rule mx-auto mt-3" />
      <div className="mt-4 space-y-4 text-sm text-navy/85">{children}</div>
    </motion.section>
  );
}

export default function ContactPage({ c, ctx, careers, st, page }) {
  const offices = st.offices || [];
  const withName = offices.length > 1;
  const emails = [...new Set(offices.map((o) => o.email).filter(has))];
  const empty = <p className="text-muted-foreground">{st.isLoading ? 'Loading contact details' : 'Please use the form below and our team will reply.'}</p>;
  const addrs = offices.filter((o) => has(o.address));
  const phoneOffices = offices.filter((o) => o.phones?.length);
  return (
    <div className="container-x py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: c.eyebrow }]} />
      <header className="mx-auto mt-8 max-w-2xl text-center">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-5xl">{c.title}</h1>
        <div className="gold-rule mx-auto mt-5" />
        <p className="mt-5 text-muted-foreground">{c.body}</p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-3" data-testid="block-contact-details">
        <InfoCard i={0} icon={MapPin} title="Location">
          {addrs.length ? addrs.map((o) => (
            <div key={o.id}>
              {withName && <h3 className="text-sm font-bold text-navy">{o.name}</h3>}
              <p className="whitespace-pre-line break-words">{o.address}</p>
            </div>
          )) : empty}
        </InfoCard>
        <InfoCard i={1} icon={Phone} title="Call us">
          {phoneOffices.length ? phoneOffices.map((o) => (
            <div key={o.id}>
              {withName && <h3 className="text-sm font-bold text-navy">{o.name}</h3>}
              <ul className="space-y-1">{o.phones.map((ph) => <li key={ph}><a href={telHref(ph)} className={link}>{ph}</a></li>)}</ul>
            </div>
          )) : empty}
        </InfoCard>
        <InfoCard i={2} icon={Mail} title="Connect">
          {emails.length ? <ul className="space-y-1">{emails.map((e) => <li key={e}><a href={`mailto:${e}`} className={`${link} break-all`}>{e}</a></li>)}</ul> : empty}
        </InfoCard>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <div className="rounded-[1.5rem] border border-navy/10 border-t-4 border-t-gold bg-white p-5 shadow-[0_24px_60px_-44px_hsl(var(--brand-navy)/.5)] sm:p-8">
          <div className="[&_.label]:text-navy [&_input[type=checkbox]]:accent-[hsl(221_76%_17%)]">
            <LeadForm key={JSON.stringify(ctx)} category={c.cat} idPrefix="contact" submitLabel={c.label} compact contactFields {...ctx} />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{careers ? 'This is a general enquiry to the team, not a job application.' : ''}</p>
      </div>

      <div className="mt-12 min-w-0 overflow-hidden rounded-2xl border border-navy/10 bg-white p-1.5 text-foreground"><OfficeLocationMap /></div>
      {page && has(page.description) && <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-surface p-5 text-foreground"><RichText text={page.description} /></div>}
    </div>
  );
}
