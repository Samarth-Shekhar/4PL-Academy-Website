import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useSubmitLead } from '@workspace/api-client-react';
import { errMsg } from '@/lib/api';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(150),
  email: z.string().trim().email('Enter a valid email address').max(250),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(25).regex(/^[0-9+()\-\s]+$/, 'Use digits, spaces, + or - only'),
  message: z.string().max(3000, 'Please keep this under 3000 characters').optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required so we can contact you' }) }),
});

function utmString() {
  const p = new URLSearchParams(window.location.search);
  const out = [];
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => { if (p.get(k)) out.push(`${k}=${p.get(k)}`); });
  return out.join('&') || undefined;
}

export function LeadForm({ category = 'contact', program, university, course, defaultMessage = '', submitLabel = 'Submit', showMessage = true, onDone, idPrefix = 'lead' }) {
  const [done, setDone] = useState(null);
  const submit = useSubmitLead();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', message: defaultMessage, consent: false },
  });
  const onSubmit = (v) => {
    submit.mutate(
      { data: { name: v.name, email: v.email, phone: v.phone, consent: true, category, university, program, course, message: v.message || undefined, source: window.location.pathname, utm: utmString() } },
      { onSuccess: (r) => { setDone(r?.message || 'Thank you. Our admissions team will reach out to you.'); reset(); onDone?.(); } },
    );
  };
  if (done) {
    return (
      <div className="rounded-lg bg-gold-soft p-6 text-center" role="status">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-gold-deep" aria-hidden="true" />
        <h3 className="text-xl text-navy">Request received</h3>
        <p className="mt-2 text-sm text-navy/80">{done}</p>
        <button type="button" className="btn btn-outline btn-sm mt-4" onClick={() => setDone(null)}>Send another request</button>
      </div>
    );
  }
  const f = (n) => `${idPrefix}-${n}`;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" data-testid={`form-${idPrefix}`}>
      {(program || university || course) && (
        <p className="rounded-md bg-mist px-3 py-2 text-sm text-navy">Regarding: <strong>{[program, course, university].filter(Boolean).join(' at ')}</strong></p>
      )}
      <div>
        <label className="label" htmlFor={f('name')}>Full name</label>
        <input id={f('name')} className="input" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="field-err">{errors.name.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={f('email')}>Email</label>
          <input id={f('email')} type="email" inputMode="email" className="input" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
          {errors.email && <p className="field-err">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor={f('phone')}>Phone</label>
          <input id={f('phone')} type="tel" inputMode="tel" className="input" autoComplete="tel" aria-invalid={!!errors.phone} {...register('phone')} />
          {errors.phone && <p className="field-err">{errors.phone.message}</p>}
        </div>
      </div>
      {showMessage && (
        <div>
          <label className="label" htmlFor={f('message')}>How can we help? <span className="font-normal text-muted-foreground">(optional)</span></label>
          <textarea id={f('message')} className="input" {...register('message')} />
          {errors.message && <p className="field-err">{errors.message.message}</p>}
        </div>
      )}
      <div>
        <label className="flex items-start gap-3 text-sm leading-snug text-foreground/80">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(221_76%_17%)]" {...register('consent')} />
          <span>I agree to be contacted by 4PL Academy about admissions, programs and courses. Support is provided for admission, training and placement; outcomes are never guaranteed.</span>
        </label>
        {errors.consent && <p className="field-err">{errors.consent.message}</p>}
      </div>
      {submit.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{errMsg(submit.error)}</p>}
      <button type="submit" disabled={submit.isPending} className="btn btn-gold w-full" data-testid={`button-submit-${idPrefix}`}>
        {submit.isPending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending</> : submitLabel}
      </button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Your details are used only for admissions guidance.</p>
    </form>
  );
}
