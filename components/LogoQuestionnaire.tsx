'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────
interface Answers {
  name: string;
  slogan: string;
  style: string;
  colors: string;
  symbol: string;
  mood: string;
}

interface Props {
  startupName: string;
}

// ── Step data ─────────────────────────────────────────────────
const STYLES = [
  { value: 'Minimalist and clean',        label: 'Minimalistisch',  icon: '◻',  desc: 'Schlicht, modern, wenig Elemente' },
  { value: 'Modern and tech-forward',     label: 'Modern & Tech',   icon: '◈',  desc: 'Futuristisch, digital, dynamisch' },
  { value: 'Playful and fun',             label: 'Verspielt',       icon: '✦',  desc: 'Locker, bunt, lebendig' },
  { value: 'Classic and professional',    label: 'Klassisch',       icon: '◉',  desc: 'Seriös, zeitlos, vertrauenswürdig' },
  { value: 'Bold and statement-making',   label: 'Bold',            icon: '▲',  desc: 'Mutig, auffällig, stark' },
];

const COLOR_PALETTES = [
  { value: 'Blue and white, professional and trustworthy', label: 'Blau & Weiß',     swatch: ['#1d4ed8', '#ffffff'] },
  { value: 'Black and gold, premium and luxurious',        label: 'Schwarz & Gold',  swatch: ['#000000', '#d97706'] },
  { value: 'Green tones, natural and sustainable',         label: 'Grün & Natur',    swatch: ['#15803d', '#86efac'] },
  { value: 'Orange and red, energetic and bold',           label: 'Orange & Rot',    swatch: ['#ea580c', '#dc2626'] },
  { value: 'Purple and violet, creative and innovative',   label: 'Lila & Kreativ',  swatch: ['#7c3aed', '#db2777'] },
  { value: 'Monochrome black and white, timeless',         label: 'Schwarz & Weiß',  swatch: ['#111827', '#f9fafb'] },
];

const SYMBOLS = [
  { value: 'Lettermark or monogram using company initials',  label: 'Monogramm',    icon: 'AB' },
  { value: 'Abstract geometric symbol',                      label: 'Abstrakt',     icon: '◇' },
  { value: 'Recognizable icon or pictogram',                 label: 'Icon',         icon: '⬡' },
  { value: 'Clean geometric shapes like circles or hexagons',label: 'Geometrisch',  icon: '△' },
  { value: 'Wordmark — styled text only, no symbol',         label: 'Schriftzug',   icon: 'Aa' },
];

const MOODS = [
  { value: 'Trustworthy, reliable, and professional',        label: 'Vertrauenswürdig', desc: 'Kunden vertrauen dir sofort' },
  { value: 'Innovative, future-oriented, and cutting-edge',  label: 'Innovativ',        desc: 'Vorreiter deiner Branche' },
  { value: 'Friendly, approachable, and human',              label: 'Freundlich',        desc: 'Nahbar und sympathisch' },
  { value: 'Exclusive, premium, and high-end',               label: 'Premium',           desc: 'Exklusiv und hochwertig' },
  { value: 'Energetic, dynamic, and powerful',               label: 'Dynamisch',         desc: 'Kraft und Bewegung' },
];

// ── Choice Card ───────────────────────────────────────────────
function ChoiceCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all
        ${selected
          ? 'border-brand-500 bg-brand-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );
}

// ── Stepper ───────────────────────────────────────────────────
function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
            ${i < current ? 'bg-brand-500 text-white'
            : i === current ? 'bg-brand-500 text-white ring-4 ring-brand-100'
            : 'bg-gray-200 text-gray-400'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 flex-1 w-6 transition-colors ${i < current ? 'bg-brand-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function LogoQuestionnaire({ startupName }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    name: startupName, slogan: '', style: '', colors: '', symbol: '', mood: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ image: string; prompt: string } | null>(null);
  const [error, setError] = useState('');

  const STEPS = ['Basis', 'Stil', 'Farben', 'Symbol', 'Stimmung'];
  const canNext = (): boolean => {
    if (step === 0) return answers.name.trim().length > 0;
    if (step === 1) return !!answers.style;
    if (step === 2) return !!answers.colors;
    if (step === 3) return !!answers.symbol;
    if (step === 4) return !!answers.mood;
    return true;
  };

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Fehler');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const downloadLogo = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${result.image}`;
    link.download = `${answers.name.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
    link.click();
  };

  // ── Result screen ──
  if (result) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-bold">Dein Logo ist fertig!</h2>
          <p className="mt-1 text-gray-500 text-sm">Generiert mit Google Imagen 3</p>
        </div>

        <div className="mx-auto w-64 h-64 rounded-2xl border border-gray-200 overflow-hidden shadow-md">
          <img
            src={`data:image/png;base64,${result.image}`}
            alt={`${answers.name} Logo`}
            className="w-full h-full object-contain"
          />
        </div>

        <details className="text-left rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
          <summary className="text-xs text-gray-500 cursor-pointer font-medium">Verwendeter Prompt anzeigen</summary>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed">{result.prompt}</p>
        </details>

        <div className="flex gap-3 justify-center">
          <button
            onClick={downloadLogo}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors"
          >
            PNG herunterladen
          </button>
          <button
            onClick={() => { setResult(null); setStep(0); }}
            className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold
                       hover:bg-gray-50 transition-colors"
          >
            Neu generieren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper current={step} total={STEPS.length} />

      {/* ── Step 0: Basis ── */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Startup-Informationen</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Startup Name *</label>
            <input
              value={answers.name}
              onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
              placeholder="Dein Startup-Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slogan <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={answers.slogan}
              onChange={(e) => setAnswers({ ...answers, slogan: e.target.value })}
              placeholder="Dein Slogan oder Claim"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {/* ── Step 1: Stil ── */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Logo-Stil</h2>
          {STYLES.map((s) => (
            <ChoiceCard key={s.value} selected={answers.style === s.value} onClick={() => setAnswers({ ...answers, style: s.value })}>
              <div className="flex items-center gap-3">
                <span className="text-2xl w-8 text-center">{s.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            </ChoiceCard>
          ))}
        </div>
      )}

      {/* ── Step 2: Farben ── */}
      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Farbpalette</h2>
          {COLOR_PALETTES.map((c) => (
            <ChoiceCard key={c.value} selected={answers.colors === c.value} onClick={() => setAnswers({ ...answers, colors: c.value })}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 shrink-0">
                  {c.swatch.map((color) => (
                    <div key={color} className="w-6 h-6 rounded-full border border-gray-200"
                         style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className="font-semibold text-sm">{c.label}</p>
              </div>
            </ChoiceCard>
          ))}
        </div>
      )}

      {/* ── Step 3: Symbol ── */}
      {step === 3 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Symbol / Form</h2>
          {SYMBOLS.map((s) => (
            <ChoiceCard key={s.value} selected={answers.symbol === s.value} onClick={() => setAnswers({ ...answers, symbol: s.value })}>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold w-8 text-center text-brand-500">{s.icon}</span>
                <p className="font-semibold text-sm">{s.label}</p>
              </div>
            </ChoiceCard>
          ))}
        </div>
      )}

      {/* ── Step 4: Stimmung ── */}
      {step === 4 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Markenstimmung</h2>
          {MOODS.map((m) => (
            <ChoiceCard key={m.value} selected={answers.mood === m.value} onClick={() => setAnswers({ ...answers, mood: m.value })}>
              <div>
                <p className="font-semibold text-sm">{m.label}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
            </ChoiceCard>
          ))}
        </div>
      )}

      {/* ── Navigation ── */}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium
                     hover:bg-gray-50 transition-colors disabled:opacity-30"
        >
          Zurück
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            Weiter →
          </button>
        ) : (
          <button
            onClick={generate}
            disabled={!canNext() || loading}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Wird generiert …
              </>
            ) : 'Logo generieren ✦'}
          </button>
        )}
      </div>
    </div>
  );
}
