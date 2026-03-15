'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { sendPasswordReset } from '@/lib/auth';

const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    setServerError('');
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="mx-auto max-w-sm w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Passwort vergessen</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Wir schicken dir einen Reset-Link per E-Mail.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📬</div>
              <p className="font-semibold">E-Mail verschickt!</p>
              <p className="text-sm text-gray-500">
                Schau in dein Postfach und klicke auf den Link, um dein Passwort zurückzusetzen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="du@startup.de"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500
                             placeholder:text-gray-400"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
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
                {isSubmitting ? 'Wird gesendet …' : 'Reset-Link senden →'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
