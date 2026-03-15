'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User;
}

export default function UserMenu({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const name: string = user.user_metadata?.full_name ?? '';
  const avatarUrl: string = user.user_metadata?.avatar_url ?? '';
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?';

  // Schließen bei Klick außerhalb
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="relative" ref={ref}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2
                   focus:ring-brand-500 focus:ring-offset-2"
        aria-label="User Menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || user.email}
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center
                          text-white text-sm font-bold select-none">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-200 bg-white
                        shadow-lg z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold truncate">{name || 'Kein Name'}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">👤</span>
              Profil bearbeiten
            </Link>
            <Link
              href="/account#password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">🔒</span>
              Passwort ändern
            </Link>
            <Link
              href="/account#avatar"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">🖼️</span>
              Avatar ändern
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                         hover:bg-red-50 transition-colors"
            >
              <span className="text-base">↩️</span>
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
