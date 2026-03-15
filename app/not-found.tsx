import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h2 className="text-2xl font-bold">Startup nicht gefunden</h2>
      <p className="text-gray-500 text-sm">Die URL ist ungültig oder das Startup wurde gelöscht.</p>
      <Link href="/" className="text-brand-500 underline text-sm">Zur Startseite</Link>
    </div>
  );
}
