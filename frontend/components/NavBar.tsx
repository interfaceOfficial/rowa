'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-brand-500 font-bold text-xl tracking-tight">
        Startup OS
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-gray-500 hidden sm:block">{user.email}</span>
            <Link
              href="/startups/new"
              className="rounded-lg bg-brand-500 px-4 py-2 text-white font-medium
                         hover:bg-brand-600 transition-colors"
            >
              + Startup
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              Abmelden
            </button>
          </>
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
