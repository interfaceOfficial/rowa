'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp, signIn } from '@/lib/auth';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  mode: 'register' | 'login';
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    setServerError('');
    try {
      if (mode === 'register') {
        await signUp(email, password);
        router.push('/auth/verify-email');
        return;
      } else {
        await signIn(email, password);
      }
      router.push('/startups/new');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="mx-auto max-w-sm w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isRegister ? 'Account erstellen' : 'Anmelden'}
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          {isRegister
            ? 'Kostenlos starten – kein Kreditkarte nötig.'
            : 'Willkommen zurück.'}
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
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

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
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

          {serverError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
              {serverError}
            </p>
          )}

          {!isRegister && (
            <div className="text-right -mt-2">
              <Link href="/auth/forgot-password" className="text-xs text-brand-500 hover:underline">
                Passwort vergessen?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white
                       hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? isRegister ? 'Wird erstellt …' : 'Anmelden …'
              : isRegister ? 'Kostenlos registrieren →' : 'Anmelden →'}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-gray-500">
        {isRegister ? (
          <>Bereits registriert?{' '}
            <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">
              Anmelden
            </Link>
          </>
        ) : (
          <>Noch kein Account?{' '}
            <Link href="/auth/register" className="text-brand-500 font-medium hover:underline">
              Registrieren
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
