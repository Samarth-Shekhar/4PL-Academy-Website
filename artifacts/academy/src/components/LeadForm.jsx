import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useSubmitLead } from '@workspace/api-client-react';
import { errMsg, usePublicList } from '@/lib/api';
import { INTERESTS, QUALIFICATIONS, captureAttribution } from '@/lib/booking';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(150),
  email: z.string().trim().email('Enter a valid email address').max(250),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(25).regex(/^[0-9+()\-\s]+$/, 'Use digits, spaces, + or - only'),
  interestedIn: z.string().max(150).optional(),
  university: z.string().max(250).optional(),
  program: z.string().max(250).optional(),
  qualification: z.string().max(150).optional(),
  city: z.string().trim().max(150).optional(),
  message: z.string().max(3000, 'Please keep this under 3000 characters').optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required so we can contact you' }) }),
});

export function LeadForm({ category = 'counselling', program, university, course, interestedIn, defaultMessage = '', submitLabel = 'Book Counselling', showMessage = true, onDone, idPrefix = 'lead' }) {
  const [done, setDone] = useState(null);
  const submit = useSubmitLead();
  const unis = usePublicList('universities', undefined, { staleTime: 120000 }).data || [];
  const progs = usePublicList('programs', undefined, { staleTime: 120000 }).data || [];
  const { register, handleSubmit, formState: { errors, dirtyFields }, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', interestedIn: interestedIn || '', university: university || '', program: program || '', qualification: '', city: '', message: defaultMessage, consent: false },
  });
  useEffect(() => {
    // Async options can replace a temporary selected option in an uncontrolled
    // select. Restore untouched context after loading, never a student's edits.
    for (const [field,value] of Object.entries({ program, university, interestedIn })) {
      if (value && !dirtyFields[field]) setValue(field,value,{shouldDirty:false});
    }
  }, [program, university, interestedIn, progs.length, unis.length, setValue, dirtyFields]);
  const onSubmit = (v) => {
    const o = (x) => (x && String(x).trim() ? String(x).trim() : undefined);
    submit.mutate(
      { data: { name: v.name, email: v.email, phone: v.phone, consent: true, category, university: o(v.university), program: o(v.program), course, interestedIn: o(v.interestedIn), qualification: o(v.qualification), city: o(v.city), message: o(v.message), source: window.location.pathname, utm: captureAttribution() } },
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
  const Err = ({ n }) => (errors[n] ? <p className="field-err">{errors[n].message}</p> : null);
  const withCurrent = (list, cur) => (cur && !list.some((x) => x.name === cur) ? [{ id: 'cur', name: cur }, ...list] : list);
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" data-testid={`form-${idPrefix}`}>
      {course && <p className="rounded-md bg-mist px-3 py-2 text-sm text-navy">Regarding course: <strong>{course}</strong></p>}
      <div><label className="label" htmlFor={f('name')}>Full name</label><input id={f('name')} className="input" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} /><Err n="name" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor={f('email')}>Email</label><input id={f('email')} type="email" inputMode="email" className="input" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} /><Err n="email" /></div>
        <div><label className="label" htmlFor={f('phone')}>Phone</label><input id={f('phone')} type="tel" inputMode="tel" className="input" autoComplete="tel" aria-invalid={!!errors.phone} {...register('phone')} /><Err n="phone" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor={f('interest')}>Interested in</label><select id={f('interest')} className="input" {...register('interestedIn')}><option value="">Select</option>{INTERESTS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label" htmlFor={f('qual')}>Highest qualification</label><select id={f('qual')} className="input" {...register('qualification')}><option value="">Select</option>{QUALIFICATIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label" htmlFor={f('uni')}>Preferred university</label><select id={f('uni')} className="input" {...register('university')}><option value="">No preference</option>{withCurrent(unis, university).map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}</select></div>
        <div><label className="label" htmlFor={f('prog')}>Preferred program</label><select id={f('prog')} className="input" {...register('program')}><option value="">No preference</option>{withCurrent(progs, program).map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
      </div>
      <div><label className="label" htmlFor={f('city')}>City</label><input id={f('city')} className="input" autoComplete="address-level2" {...register('city')} /></div>
      {showMessage && (
        <div><label className="label" htmlFor={f('message')}>Message <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id={f('message')} className="input" {...register('message')} /><Err n="message" /></div>
      )}
      <div>
        <label className="flex items-start gap-3 text-sm leading-snug text-foreground/80">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(221_76%_17%)]" {...register('consent')} />
          <span>I agree to be contacted by 4PL Academy about admissions, programs and courses. Support is provided for admission, training and placement; outcomes are never guaranteed.</span>
        </label>
        <Err n="consent" />
      </div>
      {submit.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{errMsg(submit.error)}</p>}
      <button type="submit" disabled={submit.isPending} className="btn btn-gold w-full" data-testid={`button-submit-${idPrefix}`}>
        {submit.isPending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending</> : submitLabel}
      </button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Your details are used only for admissions guidance.</p>
    </form>
  );
}
