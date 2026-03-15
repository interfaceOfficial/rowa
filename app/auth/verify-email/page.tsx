import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="mx-auto max-w-sm w-full text-center space-y-6">

        <div className="text-6xl">📬</div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bestätige deine E-Mail</h1>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Wir haben dir einen Bestätigungslink geschickt.
            Klicke auf den Link in der E-Mail, um deinen Account zu aktivieren.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-200 px-6 py-4 text-sm text-blue-700 text-left space-y-1">
          <p className="font-semibold">Keine E-Mail erhalten?</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Schau im Spam-Ordner nach</li>
            <li>Warte ca. 1–2 Minuten</li>
            <li>Prüfe ob die E-Mail-Adresse korrekt ist</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500">
          Falsche E-Mail-Adresse?{' '}
          <Link href="/auth/register" className="text-brand-500 font-medium hover:underline">
            Erneut registrieren
          </Link>
        </p>

      </div>
    </div>
  );
}
