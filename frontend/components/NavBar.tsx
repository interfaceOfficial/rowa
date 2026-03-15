'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import UserMenu from '@/components/UserMenu';
import type { User } from '@supabase/supabase-js';

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <Link
        href={user ? '/dashboard' : '/'}
        className="text-brand-500 font-bold text-xl tracking-tight"
      >
        Startup OS
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Anmelden
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-brand-500 px-4 py-2 text-white font-medium
                         hover:bg-brand-600 transition-colors"
            >
              Registrieren
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
