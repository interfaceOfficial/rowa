'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStartup, type Startup } from '@/lib/api';
import RoadmapView from '@/components/RoadmapView';

export default function RoadmapPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStartup(id).then((data) => {
      if (!data) { router.replace('/dashboard'); return; }
      setStartup(data);
      setLoading(false);
    }).catch(() => router.replace('/dashboard'));
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
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Back link */}
        <Link
          href={`/startups/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          ← Zurück zum Dashboard
        </Link>

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Startup Roadmap</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Alle Phasen und Tasks für{' '}
              <span className="font-medium text-gray-700">{startup.name}</span>
            </p>
          </div>
        </div>

        <RoadmapView startupId={startup.id} />
      </div>
    </div>
  );
}
