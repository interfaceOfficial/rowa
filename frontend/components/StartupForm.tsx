'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createStartup } from '@/lib/api';
import { getUser } from '@/lib/auth';

// ── Schema ───────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(255),
  industry: z.enum([
    'fintech', 'healthtech', 'edtech', 'ecommerce',
    'proptech', 'legaltech', 'cleantech', 'hrtech', 'logistics', 'other',
  ], { required_error: 'Branche wählen' }),
  business_model: z.enum(
    ['saas', 'marketplace', 'ecommerce', 'agency', 'other'],
    { required_error: 'Geschäftsmodell wählen' },
  ),
  stage: z.enum(['idea', 'mvp', 'growth'], { required_error: 'Stage wählen' }),
});

type FormData = z.infer<typeof schema>;

// ── Constants ────────────────────────────────────────────────
const INDUSTRIES = [
  { value: 'fintech',    label: 'FinTech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'edtech',     label: 'EdTech' },
  { value: 'ecommerce',  label: 'E-Commerce' },
  { value: 'proptech',   label: 'PropTech' },
  { value: 'legaltech',  label: 'LegalTech' },
  { value: 'cleantech',  label: 'CleanTech' },
  { value: 'hrtech',     label: 'HR Tech' },
  { value: 'logistics',  label: 'Logistik' },
  { value: 'other',      label: 'Sonstiges' },
] as const;

const BUSINESS_MODELS = [
  { value: 'saas',        label: 'SaaS' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'ecommerce',   label: 'E-Commerce' },
  { value: 'agency',      label: 'Agency / Services' },
  { value: 'other',       label: 'Sonstiges' },
] as const;

const STAGES = [
  {
    value: 'idea',
    label: 'Idea',
    description: 'Du hast eine Idee, noch kein Produkt.',
    color: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    activeColor: 'ring-2 ring-yellow-400 bg-yellow-100',
  },
  {
    value: 'mvp',
    label: 'MVP',
    description: 'Erstes Produkt in Entwicklung oder live.',
    color: 'bg-blue-50 border-blue-300 text-blue-800',
    activeColor: 'ring-2 ring-blue-400 bg-blue-100',
  },
  {
    value: 'growth',
    label: 'Growth',
    description: 'Produkt live, du skalierst aktiv.',
    color: 'bg-green-50 border-green-300 text-green-800',
    activeColor: 'ring-2 ring-green-400 bg-green-100',
  },
] as const;

// ── Component ─────────────────────────────────────────────────
export default function StartupForm() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getUser().then((user) => {
      if (!user) router.push('/auth/register');
      else setUserId(user.id);
    });
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedStage = watch('stage');

  const onSubmit = async (data: FormData) => {
    if (!userId) return;
    try {
      const startup = await createStartup({ ...data, user_id: userId });
      router.push(`/startups/${startup.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Erstellen');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Startup Name */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Startup Name *
        </label>
        <input
          id="name"
          {...register('name')}
          placeholder="z.B. Acme GmbH"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500
                     placeholder:text-gray-400"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Branche */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="industry">
          Branche *
        </label>
        <select
          id="industry"
          {...register('industry')}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">Branche wählen …</option>
          {INDUSTRIES.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1 text-xs text-red-500">{errors.industry.message}</p>
        )}
      </div>

      {/* Geschäftsmodell */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="business_model">
          Geschäftsmodell *
        </label>
        <select
          id="business_model"
          {...register('business_model')}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">Modell wählen …</option>
          {BUSINESS_MODELS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        {errors.business_model && (
          <p className="mt-1 text-xs text-red-500">{errors.business_model.message}</p>
        )}
      </div>

      {/* Startup Stage – Card-Auswahl */}
      <div>
        <p className="block text-sm font-medium mb-2">Startup Stage *</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue('stage', s.value, { shouldValidate: true })}
              className={`rounded-xl border p-4 text-left transition-all
                ${s.color}
                ${selectedStage === s.value ? s.activeColor : 'hover:opacity-80'}`}
            >
              <span className="block font-semibold text-base">{s.label}</span>
              <span className="mt-1 block text-xs opacity-80">{s.description}</span>
            </button>
          ))}
        </div>
        {errors.stage && (
          <p className="mt-1 text-xs text-red-500">{errors.stage.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white
                   hover:bg-brand-600 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Wird erstellt …' : 'Startup erstellen →'}
      </button>
    </form>
  );
}
