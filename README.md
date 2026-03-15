# Startup OS

> Die Plattform für Gründer – organisiere dein Startup von der Idee bis zum Scale-up.

---

## Architektur

```
startup-os/
├── frontend/          # Next.js 14 (App Router) + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx                    → Landing / Startseite
│   │   ├── startups/new/page.tsx       → Formular: Startup erstellen
│   │   └── startups/[id]/page.tsx      → Startup Dashboard
│   ├── components/
│   │   ├── StartupForm.tsx             → Formular-Komponente (Client)
│   │   └── StartupDashboard.tsx        → Dashboard-Komponente
│   └── lib/api.ts                      → API-Client
│
└── backend/           # Node.js + Express + TypeScript
    └── src/
        ├── index.ts                    → Server-Einstiegspunkt
        ├── routes/startups.ts          → Startup CRUD Endpoints
        ├── db/
        │   ├── client.ts               → PostgreSQL Pool
        │   └── schema.sql              → Datenbank-Schema
        └── types.ts                    → Shared Types
```

---

## Datenbank-Struktur

```sql
-- users
id, email, name, created_at

-- startups
id, user_id (FK), name, industry, business_model, stage, created_at, updated_at
```

**stage-Werte:** `idea` | `mvp` | `growth`

---

## API Endpoints

| Methode | Endpoint            | Beschreibung             |
|---------|---------------------|--------------------------|
| POST    | /api/startups       | Neues Startup erstellen  |
| GET     | /api/startups/:id   | Startup laden            |
| GET     | /api/startups?user_id= | Alle Startups eines Users |
| GET     | /health             | Health-Check             |

### POST /api/startups – Request Body
```json
{
  "name": "Acme GmbH",
  "industry": "fintech",
  "business_model": "saas",
  "stage": "idea",
  "user_id": "uuid-des-users"
}
```

### POST /api/startups – Response (201)
```json
{
  "startup": {
    "id": "uuid",
    "name": "Acme GmbH",
    "industry": "fintech",
    "business_model": "saas",
    "stage": "idea",
    "created_at": "2026-03-15T10:00:00Z",
    "updated_at": "2026-03-15T10:00:00Z"
  }
}
```

---

## UX Flow

```
Startseite (/)
     │
     ▼  Klick auf "Startup erstellen"
Formular (/startups/new)
     │
     │  User füllt aus:
     │  1. Startup Name (Freitext)
     │  2. Branche (Dropdown)
     │  3. Geschäftsmodell (Dropdown)
     │  4. Stage (Card-Auswahl: Idea / MVP / Growth)
     │
     ▼  Submit → POST /api/startups
Dashboard (/startups/:id)
     │
     │  Zeigt:
     │  - Name + Stage Badge
     │  - Info-Cards: Branche, Modell, Datum
     │  - Platzhalter für zukünftige Module
     │
     ▼  (Nächste Module: Tasks, Milestones, Team …)
```

---

## Setup & Start

### Voraussetzungen
- Node.js 20+
- PostgreSQL

### Backend
```bash
cd backend
cp .env.example .env          # DATABASE_URL anpassen
npm install
npm run db:migrate            # Schema in DB anlegen
npm run dev                   # Startet auf :4000
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # Startet auf :3000
```

---

## Nächste Module (Roadmap)

- [ ] Auth (NextAuth.js / Clerk)
- [ ] Tasks & To-dos
- [ ] Milestones & OKRs
- [ ] Team Management
- [ ] Investor-Updates
