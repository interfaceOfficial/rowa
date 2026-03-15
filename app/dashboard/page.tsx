'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getUserStartups, type Startup } from '@/lib/api';

const STAGE_CONFIG = {
  idea:   { label: 'Idea',   badge: 'bg-yellow-100 text-yellow-800' },
  mvp:    { label: 'MVP',    badge: 'bg-blue-100 text-blue-800'   },
  growth: { label: 'Growth', badge: 'bg-green-100 text-green-800' },
} as const;

const INDUSTRY_LABELS: Record<string, string> = {
  fintech: 'FinTech', healthtech: 'HealthTech', edtech: 'EdTech',
  ecommerce: 'E-Commerce', proptech: 'PropTech', legaltech: 'LegalTech',
  cleantech: 'CleanTech', hrtech: 'HR Tech', logistics: 'Logistik', other: 'Sonstiges',
};

const BM_LABELS: Record<string, string> = {
  saas: 'SaaS', marketplace: 'Marketplace', ecommerce: 'E-Commerce',
  agency: 'Agency', other: 'Sonstiges',
};

export default function DashboardPage() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) {
        router.push('/auth/login');
        return;
      }
      const result = await getUserStartups(user.id);
      setStartups(result);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400 text-sm">Laden …</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Startups</h1>
          <p className="mt-1 text-gray-500 text-sm">
            {startups.length === 0
              ? 'Noch kein Startup erstellt.'
              : `${startups.length} Startup${startups.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/startups/new"
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                     hover:bg-brand-600 transition-colors"
        >
          + Neues Startup
        </Link>
      </div>

      {startups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-gray-400 text-sm mb-4">Du hast noch kein Startup erstellt.</p>
          <Link
            href="/startups/new"
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors"
          >
            Erstes Startup erstellen →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {startups.map((startup) => {
            const stage = STAGE_CONFIG[startup.stage];
            return (
              <Link
                key={startup.id}
                href={`/startups/${startup.id}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
                           hover:shadow-md hover:border-brand-500 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h2 className="font-bold text-lg group-hover:text-brand-500 transition-colors leading-tight">
                    {startup.name}
                  </h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${stage.badge}`}>
                    {stage.label}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>{INDUSTRY_LABELS[startup.industry] ?? startup.industry}</p>
                  <p>{BM_LABELS[startup.business_model] ?? startup.business_model}</p>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  {new Date(startup.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
