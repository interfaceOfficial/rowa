import type { Startup } from '@/lib/api';

const STAGE_CONFIG = {
  idea: {
    label: 'Idea',
    badge: 'bg-yellow-100 text-yellow-800',
    description: 'Du bist in der Ideenphase. Validiere deine Annahmen.',
  },
  mvp: {
    label: 'MVP',
    badge: 'bg-blue-100 text-blue-800',
    description: 'Dein MVP ist in Arbeit. Bau das Kernprodukt.',
  },
  growth: {
    label: 'Growth',
    badge: 'bg-green-100 text-green-800',
    description: 'Du skalierst. Fokus auf Wachstum und Retention.',
  },
} as const;

const INDUSTRY_LABELS: Record<string, string> = {
  fintech: 'FinTech', healthtech: 'HealthTech', edtech: 'EdTech',
  ecommerce: 'E-Commerce', proptech: 'PropTech', legaltech: 'LegalTech',
  cleantech: 'CleanTech', hrtech: 'HR Tech', logistics: 'Logistik', other: 'Sonstiges',
};

const BM_LABELS: Record<string, string> = {
  saas: 'SaaS', marketplace: 'Marketplace', ecommerce: 'E-Commerce',
  agency: 'Agency / Services', other: 'Sonstiges',
};

interface Props {
  startup: Startup;
}

export default function StartupDashboard({ startup }: Props) {
  const stage = STAGE_CONFIG[startup.stage];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{startup.name}</h1>
          <p className="mt-1 text-gray-500 text-sm">{stage.description}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stage.badge}`}>
          {stage.label}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard label="Branche" value={INDUSTRY_LABELS[startup.industry] ?? startup.industry} />
        <InfoCard label="Geschäftsmodell" value={BM_LABELS[startup.business_model] ?? startup.business_model} />
        <InfoCard
          label="Erstellt am"
          value={new Date(startup.created_at).toLocaleDateString('de-DE', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
      </div>

      {/* Next Steps placeholder */}
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
        Weitere Module (Tasks, Milestones, Team) werden hier erscheinen.
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
