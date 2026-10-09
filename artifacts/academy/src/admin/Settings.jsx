import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangeAdminPassword } from '@workspace/api-client-react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { errMsg } from '@/lib/api';
import ContentManager from './ContentManager';

const schema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(12, 'Use at least 12 characters').max(200),
  confirm: z.string(),
}).refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function Settings() {
  const change = useChangeAdminPassword();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });
  const submit = (v) => change.mutate({ data: { currentPassword: v.currentPassword, newPassword: v.newPassword } }, { onSuccess: () => reset() });
  return (
    <div className="space-y-10">
      <section className="form-surface max-w-xl p-5 sm:p-8">
        <h2 className="text-2xl text-navy">Change password</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Passwords are stored only as secure hashes and are never displayed.</p>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          {[['currentPassword', 'Current password', 'current-password'], ['newPassword', 'New password (12 characters or more)', 'new-password'], ['confirm', 'Confirm new password', 'new-password']].map(([n, l, ac]) => (
            <div key={n}><label className="label" htmlFor={`pw-${n}`}>{l}</label><input id={`pw-${n}`} type="password" autoComplete={ac} className="input" {...register(n)} />{errors[n] && <p className="field-err">{errors[n].message}</p>}</div>
          ))}
          {change.isError && <p className="form-alert" role="alert">{errMsg(change.error)}</p>}
          {change.isSuccess && <p className="flex items-center gap-2 rounded-md bg-gold-soft p-3 text-sm text-navy" role="status"><CheckCircle2 className="h-4 w-4 text-gold-deep" aria-hidden="true" />{change.data?.message || 'Password updated.'}</p>}
          <button type="submit" className="btn btn-navy" disabled={change.isPending} data-testid="button-change-password">{change.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button>
        </form>
      </section>
      <section>
        <h2 className="text-2xl text-navy">Site and page content settings</h2><div className="gold-rule mt-3" />
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Editable site-wide values such as contact details and notices.</p>
        <ContentManager kind="settings" embedded />
      </section>
    </div>
  );
}
