import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminLogin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { Loader2, ShieldAlert, Lock } from 'lucide-react';
import { useAdminSession, errMsg } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { Logo } from '@/components/Layout';

const schema = z.object({ email: z.string().trim().email('Enter your admin email'), password: z.string().min(1, 'Enter your password').max(200) });

export default function Login() {
  useSeo({ title: 'Admin sign in', noindex: true });
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const session = useAdminSession();
  const login = useAdminLogin();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  useEffect(() => { if (session.data?.authenticated) nav('/admin/dashboard'); }, [session.data, nav]);
  const setup = session.data?.setupRequired;
  const onSubmit = (data) => login.mutate({ data }, { onSuccess: (s) => { qc.setQueryData(getGetAdminSessionQueryKey(), s); nav('/admin/dashboard'); } });
  return (
    <div className="navy-surface on-navy grid min-h-[100dvh] place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><div className="rounded-lg bg-surface px-4 py-2"><Logo className="h-24" /></div></div>
        <div className="rounded-xl bg-card p-6 text-foreground shadow-2xl sm:p-8">
          <p className="eyebrow">Content studio</p>
          <h1 className="mt-1 text-3xl text-navy">Admin sign in</h1>
          {setup && (
            <div className="mt-4 flex gap-3 rounded-lg border border-gold bg-gold-soft p-4 text-sm text-navy" role="alert" data-testid="notice-setup-required">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" />
              <div><p className="font-bold">Admin setup is required</p><p className="mt-1">No administrator exists yet. The site owner must initialise the admin account from the server environment configuration (admin email, admin password and session secret) and restart the server. Credentials are never shown here and cannot be created from this screen.</p></div>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
            <div><label className="label" htmlFor="adm-email">Email</label><input id="adm-email" type="email" autoComplete="username" className="input" disabled={setup} {...register('email')} data-testid="input-admin-email" />{errors.email && <p className="field-err">{errors.email.message}</p>}</div>
            <div><label className="label" htmlFor="adm-pass">Password</label><input id="adm-pass" type="password" autoComplete="current-password" className="input" disabled={setup} {...register('password')} data-testid="input-admin-password" />{errors.password && <p className="field-err">{errors.password.message}</p>}</div>
            {login.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">{errMsg(login.error)}</p>}
            {session.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive" role="alert">Could not reach the server. <button type="button" className="underline" onClick={() => session.refetch()}>Retry</button></p>}
            <button type="submit" className="btn btn-navy w-full" disabled={login.isPending || setup} data-testid="button-admin-login">{login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" aria-hidden="true" />} Sign in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
