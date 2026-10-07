import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useSubmitLead } from '@workspace/api-client-react';
import { BrandSelect } from '@/components/BrandSelect';
import { errMsg } from '@/lib/api';
import { captureAttribution } from '@/lib/booking';

const TYPES = ['University', 'College', 'Education / training organisation', 'Industry / business', 'Other'];
const FOCUS = [
  { value: 'alliance', label: 'University Alliance Program' },
  { value: 'curriculum', label: 'Curriculum integration' },
  { value: 'training', label: 'Expert-led training' },
  { value: 'projects', label: 'Live projects and career pathways' },
  { value: 'other', label: 'Other collaboration' },
];
const schema = z.object({
  organisation: z.string().trim().min(2, 'Enter your institution or organisation name').max(200),
  organisationType: z.string().refine((v) => TYPES.includes(v), 'Select an organisation type'),
  name: z.string().trim().min(2, 'Enter your full name').max(150),
  role: z.string().trim().max(120).optional(),
  email: z.string().trim().email('Enter a valid email address').max(250),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(25).regex(/^[0-9+()\-\s]+$/, 'Use digits, spaces, + or - only'),
  website: z.string().trim().max(250).refine((v) => {
    if (!v) return true;
    try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; }
  }, 'Enter a full website address, such as https://example.com').optional(),
  city: z.string().trim().max(150).optional(),
  focus: z.string().refine((v) => FOCUS.some((o) => o.value === v), 'Choose a collaboration area'),
  otherFocus: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, 'Tell us a little more about your collaboration goals').max(1600, 'Please keep your message under 1600 characters'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please agree so we can respond to your enquiry' }) }),
}).superRefine((v, ctx) => {
  if (v.focus === 'other' && (v.otherFocus || '').length < 3) ctx.addIssue({ code: 'custom', path: ['otherFocus'], message: 'Describe the collaboration area' });
});

function InputField({ name, label, register, error, optional = false, type = 'text', autoComplete, maxLength, wide = false }) {
  const id = `partner-${name}`;
  return <div className={wide ? 'sm:col-span-2' : ''}>
    <label className="label" htmlFor={id}>{label}{optional ? <span className="ml-1 font-normal text-muted-foreground">(optional)</span> : <span className="text-gold-deep"> *</span>}</label>
    <input id={id} className="input" type={type} autoComplete={autoComplete} maxLength={maxLength} required={!optional} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...register(name)} />
    {error && <p id={`${id}-error`} className="field-err">{error.message}</p>}
  </div>;
}
function SelectField({ name, label, control, options, error }) {
  return <div>
    <label className="label" htmlFor={`partner-${name}`}>{label}<span className="text-gold-deep"> *</span></label>
    <Controller name={name} control={control} render={({ field }) => <BrandSelect id={`partner-${name}`} name={field.name} ref={field.ref} value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} options={options.map((o) => typeof o === 'string' ? { value: o, label: o } : o)} placeholder="Please select" />} />
    {error && <p className="field-err">{error.message}</p>}
  </div>;
}

export function PartnerForm() {
  const [done, setDone] = useState(false);
  const submit = useSubmitLead();
  const { register, control, handleSubmit, reset, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { organisation: '', organisationType: '', name: '', role: '', email: '', phone: '', website: '', city: '', focus: '', otherFocus: '', message: '', consent: false },
  });
  const other = watch('focus') === 'other';
  const onSubmit = (v) => {
    const focus = v.focus === 'other' ? v.otherFocus : FOCUS.find((o) => o.value === v.focus).label;
    // Use the existing partnership lead contract; institutional details remain
    // complete in the message rather than becoming learner program preferences.
    const message = [
      `Institution / organisation: ${v.organisation}`,
      `Organisation type: ${v.organisationType}`,
      v.role && `Contact role: ${v.role}`,
      v.website && `Website: ${v.website}`,
      `Collaboration area: ${focus}`,
      '', 'Collaboration goals:', v.message,
    ].filter((line) => line !== false && line !== undefined).join('\n');
    if (message.length > 3000) { setError('message', { message: 'Please shorten your message so all your organisation details can be included.' }); return; }
    submit.mutate({ data: { name: v.name, email: v.email, phone: v.phone, category: 'partnership', consent: true, interestedIn: focus, city: v.city || undefined, message, source: window.location.pathname, utm: captureAttribution() } },
      { onSuccess: () => { setDone(true); reset(); } });
  };
  if (done) return <div className="rounded-2xl bg-gold-soft p-6 text-center" role="status" data-testid="partner-success">
    <CheckCircle2 className="mx-auto h-10 w-10 text-gold-deep" aria-hidden="true" />
    <h3 className="mt-4 text-2xl font-bold text-navy">Enquiry received</h3>
    <p className="mt-3 text-sm leading-relaxed text-navy/80">Thank you for reaching out. Our team will review your collaboration goals and contact you using the details provided.</p>
    <button type="button" className="btn btn-outline mt-5" onClick={() => { submit.reset(); setDone(false); }}>Send another enquiry</button>
  </div>;
  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-partner">
    <div className="grid gap-4 sm:grid-cols-2">
      <InputField name="organisation" label="Institution / organisation" register={register} error={errors.organisation} maxLength={200} wide />
      <SelectField name="organisationType" label="Organisation type" control={control} error={errors.organisationType} options={TYPES} />
      <InputField name="city" label="City / country" register={register} error={errors.city} optional autoComplete="address-level2" maxLength={150} />
      <InputField name="name" label="Contact name" register={register} error={errors.name} autoComplete="name" maxLength={150} />
      <InputField name="role" label="Your role / designation" register={register} error={errors.role} optional autoComplete="organization-title" maxLength={120} />
      <InputField name="email" label="Work email" register={register} error={errors.email} type="email" autoComplete="email" maxLength={250} />
      <InputField name="phone" label="Phone" register={register} error={errors.phone} type="tel" autoComplete="tel" maxLength={25} />
      <InputField name="website" label="Institution website" register={register} error={errors.website} optional type="url" maxLength={250} wide />
      <div className="sm:col-span-2"><SelectField name="focus" label="Collaboration area" control={control} error={errors.focus} options={FOCUS} /></div>
      {other && <InputField name="otherFocus" label="Tell us the collaboration area" register={register} error={errors.otherFocus} maxLength={150} wide />}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="partner-message">How would you like to collaborate?<span className="text-gold-deep"> *</span></label>
        <textarea id="partner-message" className="input min-h-32" maxLength={1600} required aria-invalid={!!errors.message} {...register('message')} placeholder="Share your institution's goals, areas of interest and what you would like to discuss." />
        {errors.message && <p className="field-err">{errors.message.message}</p>}
      </div>
    </div>
    <div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-navy/85"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[hsl(221_76%_17%)]" {...register('consent')} /><span>I agree to be contacted by 4PL Academy about this partnership enquiry.</span></label>
      {errors.consent && <p className="field-err">{errors.consent.message}</p>}
    </div>
    {submit.isError && <p className="rounded-xl bg-red-50 p-3 text-sm text-destructive" role="alert">{errMsg(submit.error)}</p>}
    <button type="submit" disabled={submit.isPending} className="btn btn-gold w-full" data-testid="submit-partner">{submit.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Submit partnership enquiry'}</button>
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Your details are used to respond to your collaboration enquiry.</p>
  </form>;
}
