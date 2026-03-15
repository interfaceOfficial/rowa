'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStartup, type Startup } from '@/lib/api';
import StartupDashboard from '@/components/StartupDashboard';
import KanbanBoard from '@/components/KanbanBoard';

export default function StartupPage() {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getStartup(id)
      .then(setStartup)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <h2 className="text-2xl font-bold">Startup nicht gefunden</h2>
        <p className="text-gray-500 text-sm">Die URL ist ungültig oder das Startup wurde gelöscht.</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 text-sm">Laden …</div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <StartupDashboard startup={startup} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-5">Taskboard</h2>
        <KanbanBoard startupId={startup.id} />
      </div>
    </div>
  );
}
