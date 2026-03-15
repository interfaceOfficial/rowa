import StartupForm from '@/components/StartupForm';

export default function NewStartupPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Neues Startup erstellen</h1>
        <p className="mt-2 text-gray-500 text-sm">
          Füll die Details aus – dein Dashboard wird automatisch erstellt.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
        <StartupForm />
      </div>
    </div>
  );
}
