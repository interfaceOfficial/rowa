'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStartup, type Startup } from '@/lib/api';
import LogoQuestionnaire from '@/components/LogoQuestionnaire';

export default function LogoGeneratorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStartup(id).then((data) => {
      if (!data) { router.replace('/dashboard'); return; }
      setStartup(data);
      setLoading(false);
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Wird geladen …
      </div>
    );
  }

  if (!startup) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Back link */}
        <Link
          href={`/startups/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          ← Zurück zum Dashboard
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Logo Generator</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Erstelle ein professionelles Logo für <span className="font-medium text-gray-700">{startup.name}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <LogoQuestionnaire startupName={startup.name} />
        </div>

      </div>
    </div>
  );
}
