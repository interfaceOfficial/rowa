'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { updateProfile, updatePassword, uploadAvatar } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

// ── Schemas ───────────────────────────────────────────────────
const profileSchema = z.object({
  name:  z.string().min(1, 'Name ist erforderlich'),
  email: z.string().email('Ungültige E-Mail'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirm'],
});

type ProfileData  = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

// ── Section wrapper ───────────────────────────────────────────
function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
      {msg}
    </p>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
      {msg}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile form ──
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // ── Password form ──
  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (!u) { router.push('/auth/login'); return; }
      setUser(u);
      setAvatarUrl(u.user_metadata?.avatar_url ?? '');
      resetProfile({
        name:  u.user_metadata?.full_name ?? '',
        email: u.email ?? '',
      });
    });
  }, [router, resetProfile]);

  // ── Handlers ──────────────────────────────────────────────
  const onProfileSubmit = async (data: ProfileData) => {
    setProfileMsg(''); setProfileError('');
    try {
      await updateProfile(data.name, data.email);
      setProfileMsg('Profil wurde gespeichert.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Fehler');
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPwMsg(''); setPwError('');
    try {
      await updatePassword(data.password);
      resetPw();
      setPwMsg('Passwort wurde geändert.');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Fehler');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarLoading(true); setAvatarError('');
    try {
      const url = await uploadAvatar(file, user.id);
      setAvatarUrl(url);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setAvatarLoading(false);
    }
  };

  const initials = user
    ? (user.user_metadata?.full_name ?? user.email ?? '?')
        .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-gray-500 text-sm">Verwalte deine Profildaten.</p>
      </div>

      {/* ── Avatar ── */}
      <Section id="avatar" title="Profilbild">
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center
                            text-white text-2xl font-bold select-none">
              {initials}
            </div>
          )}
          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                         hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {avatarLoading ? 'Wird hochgeladen …' : 'Bild ändern'}
            </button>
            <p className="text-xs text-gray-400">JPG oder PNG, max. 2 MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={onAvatarChange}
        />
        {avatarError && <ErrorBanner msg={avatarError} />}
      </Section>

      {/* ── Profil ── */}
      <Section title="Name & E-Mail">
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...regProfile('name')}
              placeholder="Max Mustermann"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
            {profileErrors.name && (
              <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              {...regProfile('email')}
              type="email"
              placeholder="du@startup.de"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
            {profileErrors.email && (
              <p className="mt-1 text-xs text-red-500">{profileErrors.email.message}</p>
            )}
          </div>
          {profileMsg   && <SuccessBanner msg={profileMsg} />}
          {profileError && <ErrorBanner msg={profileError} />}
          <button
            type="submit"
            disabled={profileSubmitting}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {profileSubmitting ? 'Wird gespeichert …' : 'Speichern'}
          </button>
        </form>
      </Section>

      {/* ── Passwort ── */}
      <Section id="password" title="Passwort ändern">
        <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort</label>
            <input
              {...regPw('password')}
              type="password"
              autoComplete="new-password"
              placeholder="Mindestens 6 Zeichen"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
            {pwErrors.password && (
              <p className="mt-1 text-xs text-red-500">{pwErrors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passwort bestätigen</label>
            <input
              {...regPw('confirm')}
              type="password"
              autoComplete="new-password"
              placeholder="Passwort wiederholen"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
            {pwErrors.confirm && (
              <p className="mt-1 text-xs text-red-500">{pwErrors.confirm.message}</p>
            )}
          </div>
          {pwMsg   && <SuccessBanner msg={pwMsg} />}
          {pwError && <ErrorBanner msg={pwError} />}
          <button
            type="submit"
            disabled={pwSubmitting}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {pwSubmitting ? 'Wird gespeichert …' : 'Passwort ändern'}
          </button>
        </form>
      </Section>
    </div>
  );
}
