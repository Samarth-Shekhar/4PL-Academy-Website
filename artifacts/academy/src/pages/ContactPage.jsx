import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { telHref } from '@/lib/settings';
import { has } from '@/lib/format';
import { RichText } from '@/components/RichText';
import { LeadForm } from '@/components/LeadForm';
import { PageHero } from '@/components/ui-kit';
import { OfficeLocationMap } from '@/components/OfficeLocationMap';

const link = 'min-w-0 text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold';

function InfoCard({ icon: Icon, title, testid, children, i = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.section aria-label={title} data-testid={testid} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} className="contact-info group/card flex min-w-0 gap-4 rounded-[1.25rem] border border-navy/10 bg-white p-4 sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy text-gold" aria-hidden="true"><Icon className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-extrabold text-navy">{title}</h2>
        <div className="mt-2 space-y-3 break-words text-sm text-navy/85">{children}</div>
      </div>
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
    <div>
    <PageHero eyebrow={c.eyebrow} title={c.title} body={c.body} crumbs={[{ label: 'Home', href: '/' }, { label: c.eyebrow }]} />
    <div className="container-x py-8 sm:py-14">
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-10">
      <div className="min-w-0">
        <div className="form-surface p-5 sm:p-8">
          <div className="[&_.label]:text-navy [&_input[type=checkbox]]:accent-[hsl(221_76%_17%)]">
            <LeadForm key={JSON.stringify(ctx)} category={c.cat} idPrefix="contact" submitLabel={c.label} compact contactFields {...ctx} />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{careers ? 'This is a general enquiry to the team, not a job application.' : ''}</p>
      </div>
        <div className="min-w-0 space-y-3">
        <div className="grid gap-3" data-testid="block-contact-details">
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
      <div className="min-w-0 overflow-hidden rounded-2xl border border-navy/10 bg-white p-1.5 text-foreground"><OfficeLocationMap /></div>
        </div>
      </div>
      {page && has(page.description) && <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-surface p-5 text-foreground"><RichText text={page.description} /></div>}
    </div>
    </div>
  );
}
