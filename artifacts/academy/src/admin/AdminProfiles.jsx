import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { KeyRound, Loader2, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { getListAdminProfilesQueryKey, useCreateAdminProfile, useListAdminProfiles, useResetAdminProfilePassword } from '@workspace/api-client-react';
import { useAdminSession } from '@/lib/api';
import { errMsg } from '@/lib/api';
import { fmtDate } from '@/lib/format';
import { Modal } from '@/components/Modal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui-kit';

const createSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(250),
  initialPassword: z.string().min(12, 'Use at least 12 characters').max(200),
  confirmPassword: z.string(),
}).refine((v) => v.initialPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

const resetSchema = z.object({
  newPassword: z.string().min(12, 'Use at least 12 characters').max(200),
  confirmPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export default function AdminProfiles() {
  const session = useAdminSession();
  const allowed = session.data?.canManageAdmins === true;
  const queryClient = useQueryClient();
  const profiles = useListAdminProfiles({ query: { queryKey: getListAdminProfilesQueryKey(), enabled: allowed, refetchOnMount: true } });
  const create = useCreateAdminProfile();
  const reset = useResetAdminProfilePassword();
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [createError, setCreateError] = useState('');
  const [resetError, setResetError] = useState('');
  const [message, setMessage] = useState('');

  const createForm = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { email: '', initialPassword: '', confirmPassword: '' },
  });
  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const openCreate = () => {
    createForm.reset({ email: '', initialPassword: '', confirmPassword: '' });
    setCreateError('');
    setMessage('');
    setCreateOpen(true);
  };
  const openReset = (profile) => {
    resetForm.reset({ newPassword: '', confirmPassword: '' });
    setResetError('');
    setMessage('');
    setResetTarget(profile);
  };
  const submitCreate = (values) => {
    setCreateError('');
    create.mutate({ data: { email: values.email.trim().toLowerCase(), initialPassword: values.initialPassword } }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getListAdminProfilesQueryKey() });
        setCreateOpen(false);
        createForm.reset();
        setMessage('Admin profile created. The new account can sign in using its email and initial password.');
      },
      onError: (error) => setCreateError(errMsg(error)),
    });
  };
  const submitReset = (values) => {
    if (!resetTarget) return;
    setResetError('');
    reset.mutate({ id: resetTarget.id, data: { newPassword: values.newPassword } }, {
      onSuccess: () => {
        setMessage(`Password reset for ${resetTarget.email}. Existing sessions for that account were signed out.`);
        setResetTarget(null);
        resetForm.reset();
      },
      onError: (error) => setResetError(errMsg(error)),
    });
  };

  if (session.isLoading) return <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-28" /></div>;
  if (!allowed) return <section className="card-s p-6"><h2 className="text-xl text-navy">Owner access required</h2><p className="mt-2 text-sm text-muted-foreground">Only the administrator whose email matches the configured owner account can manage admin profiles.</p></section>;

  return (
    <div className="space-y-5">
      <section className="card-s flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Account access</p>
          <h2 className="mt-1 font-display text-2xl text-navy">Admin profiles</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">View account IDs and emails, create administrator logins, or set a new password. Passwords are never displayed.</p>
        </div>
        <button type="button" className="btn btn-gold self-start sm:self-auto" onClick={openCreate} data-testid="button-create-admin-profile"><UserPlus className="h-4 w-4" aria-hidden="true" />Create admin profile</button>
      </section>
      {message && <p className="rounded-xl bg-gold-soft p-4 text-sm text-navy" role="status">{message}</p>}

      {profiles.isLoading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        : profiles.isError ? <ErrorState onRetry={profiles.refetch} />
          : !profiles.data?.length ? <EmptyState icon={Users} title="No admin profiles" body="Create the first additional administrator profile." />
            : <ul className="space-y-2">
              {profiles.data.map((profile) => (
                <li key={profile.id} className="card-s flex flex-col gap-3 p-4 sm:flex-row sm:items-center" data-testid={`admin-profile-${profile.id}`}>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-soft text-navy"><Users className="h-5 w-5" aria-hidden="true" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-semibold text-navy">{profile.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">ID {profile.id} · {profile.role} · created {fmtDate(profile.createdAt)}</p>
                    {profile.isOwner && <span className="chip chip-gold mt-2"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Configured owner</span>}
                    {!profile.isOwner && profile.canManageAdmins && <span className="chip chip-gold mt-2"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Profile manager</span>}
                  </div>
                  <button type="button" className="btn btn-outline btn-sm self-start sm:self-auto" onClick={() => openReset(profile)} data-testid={`button-reset-admin-password-${profile.id}`}><KeyRound className="h-4 w-4" aria-hidden="true" />Set new password</button>
                </li>
              ))}
            </ul>}

      <Modal open={createOpen} onOpenChange={(open) => { if (!open && !create.isPending) setCreateOpen(false); }} title="Create admin profile" description="The password is stored as a secure hash and will not be shown again.">
        <form onSubmit={createForm.handleSubmit(submitCreate)} noValidate className="space-y-4">
          <div><label className="label" htmlFor="admin-profile-email">Email</label><input id="admin-profile-email" type="email" autoComplete="username" className="input" {...createForm.register('email')} />{createForm.formState.errors.email && <p className="field-err">{createForm.formState.errors.email.message}</p>}</div>
          <div><label className="label" htmlFor="admin-profile-password">Initial password</label><input id="admin-profile-password" type="password" autoComplete="new-password" className="input" {...createForm.register('initialPassword')} /><p className="hint">Use at least 12 characters.</p>{createForm.formState.errors.initialPassword && <p className="field-err">{createForm.formState.errors.initialPassword.message}</p>}</div>
          <div><label className="label" htmlFor="admin-profile-password-confirm">Confirm initial password</label><input id="admin-profile-password-confirm" type="password" autoComplete="new-password" className="input" {...createForm.register('confirmPassword')} />{createForm.formState.errors.confirmPassword && <p className="field-err">{createForm.formState.errors.confirmPassword.message}</p>}</div>
          {createError && <p className="form-alert" role="alert">{createError}</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" disabled={create.isPending} onClick={() => setCreateOpen(false)}>Cancel</button><button type="submit" className="btn btn-navy" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Create profile</button></div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onOpenChange={(open) => { if (!open && !reset.isPending) setResetTarget(null); }} title="Set a new password" description={resetTarget ? `Set a new password for ${resetTarget.email}. Their other sessions will be signed out.` : ''}>
        <form onSubmit={resetForm.handleSubmit(submitReset)} noValidate className="space-y-4">
          <div><label className="label" htmlFor="admin-reset-password">New password</label><input id="admin-reset-password" type="password" autoComplete="new-password" className="input" {...resetForm.register('newPassword')} /><p className="hint">Use at least 12 characters.</p>{resetForm.formState.errors.newPassword && <p className="field-err">{resetForm.formState.errors.newPassword.message}</p>}</div>
          <div><label className="label" htmlFor="admin-reset-password-confirm">Confirm new password</label><input id="admin-reset-password-confirm" type="password" autoComplete="new-password" className="input" {...resetForm.register('confirmPassword')} />{resetForm.formState.errors.confirmPassword && <p className="field-err">{resetForm.formState.errors.confirmPassword.message}</p>}</div>
          {resetError && <p className="form-alert" role="alert">{resetError}</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" disabled={reset.isPending} onClick={() => setResetTarget(null)}>Cancel</button><button type="submit" className="btn btn-danger" disabled={reset.isPending}>{reset.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Reset password</button></div>
        </form>
      </Modal>
    </div>
  );
}
