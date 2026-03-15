# Startup OS

> Die Plattform für Gründer – organisiere dein Startup von der Idee bis zum Scale-up.

**Stack:** Next.js 16 · React · Tailwind CSS · Supabase (Auth + DB + Storage)

---

## Projektstruktur

```
rowa/
├── app/                          # Next.js App Router
│   ├── page.tsx                  → Landing / Redirect wenn eingeloggt
│   ├── dashboard/page.tsx        → Startup-Übersicht
│   ├── startups/
│   │   ├── new/page.tsx          → Startup erstellen
│   │   └── [id]/page.tsx         → Startup Dashboard + Kanban
│   ├── auth/
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── account/page.tsx          → Profil, Passwort, Avatar
│
├── components/
│   ├── NavBar.tsx
│   ├── UserMenu.tsx
│   ├── AuthForm.tsx
│   ├── StartupForm.tsx
│   ├── StartupDashboard.tsx
│   ├── KanbanBoard.tsx
│   ├── KanbanCard.tsx
│   └── TaskModal.tsx
│
├── lib/
│   ├── supabase.ts               → Supabase Client
│   ├── api.ts                    → DB-Funktionen (Startups, Tasks)
│   └── auth.ts                   → Auth-Funktionen
│
└── db/
    └── schema.sql                → PostgreSQL Schema (in Supabase ausführen)
```

---

## Setup

### 1. Supabase vorbereiten

- Neues Projekt auf [supabase.com](https://supabase.com) anlegen
- **SQL Editor:** Inhalt von `db/schema.sql` einfügen und ausführen
- **Table Editor:** RLS für `startups` und `tasks` deaktivieren
- **Storage:** Neuen Bucket `avatars` anlegen (Public: ✓)

### 2. Umgebungsvariablen

```bash
cp .env.local.example .env.local
```

`.env.local` befüllen:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
```

### 3. Starten

```bash
npm install
npm run dev   # → http://localhost:3000
```

---

## Features

- **Auth** – Registrierung (mit Name), Login, Passwort vergessen, E-Mail-Bestätigung
- **Account** – Name/E-Mail ändern, Passwort ändern, Avatar hochladen
- **Startups** – Erstellen mit Branche, Geschäftsmodell, Stage
- **Kanban Board** – 5 Spalten, Drag & Drop, Tags, Enddatum

---

## Nächste Module (Roadmap)

- [ ] Milestones & OKRs
- [ ] Team Management
- [ ] Investor-Updates
