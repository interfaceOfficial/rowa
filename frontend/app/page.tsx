'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) router.replace('/dashboard');
    });
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center gap-6">
      <h1 className="text-5xl font-bold tracking-tight">Dein Startup OS</h1>
      <p className="text-gray-500 text-lg max-w-md">
        Organisiere, tracke und skaliere dein Startup – alles an einem Ort.
      </p>
      <div className="flex gap-3">
        <Link
          href="/auth/register"
          className="rounded-xl bg-brand-500 px-6 py-3 text-white font-semibold
                     hover:bg-brand-600 transition-colors"
        >
          Kostenlos starten →
        </Link>
        <Link
          href="/auth/login"
          className="rounded-xl border border-gray-300 px-6 py-3 font-semibold
                     hover:bg-gray-50 transition-colors"
        >
          Anmelden
        </Link>
      </div>
    </div>
  );
}
