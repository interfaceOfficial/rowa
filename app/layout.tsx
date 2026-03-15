import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Startup OS',
  description: 'Your operating system for building startups.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <NavBar />
        <main className="mx-auto max-w-screen-2xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
