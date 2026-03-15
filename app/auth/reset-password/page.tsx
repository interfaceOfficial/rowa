'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/auth';

const schema = z.object({
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormData) => {
    setServerError('');
    try {
      await updatePassword(password);
      router.push('/auth/login?reset=success');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="mx-auto max-w-sm w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Neues Passwort</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Wähle ein neues Passwort für deinen Account.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Neues Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                placeholder="Mindestens 6 Zeichen"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500
                           placeholder:text-gray-400"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirm">
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                {...register('confirm')}
                placeholder="Passwort wiederholen"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500
                           placeholder:text-gray-400"
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-500">{errors.confirm.message}</p>
              )}
            </div>

            {serverError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white
                         hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Wird gespeichert …' : 'Passwort speichern →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
