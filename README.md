# World Cup Fantasy Draft

A private World Cup fantasy competition web app for friends. Draft players, make predictions, place bets, and compete for rewards and punishments throughout the tournament.

**Phase 1** delivers the foundation: authentication, role-based access, database schema, navigation, and empty page layouts ready for Phase 2 features.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Auth:** [Auth.js / NextAuth v5](https://authjs.dev/)
- **Deployment:** [Vercel](https://vercel.com/)
- **Validation:** Zod

## Getting Started (Local)

### Prerequisites

- Node.js 20+
- PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres))

### 1. Clone and install

```bash
git clone <your-repo-url>
cd world-cup-fantasy-draft
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for session encryption. Generate with: `openssl rand -base64 32` |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000` locally) |
| `NEXT_PUBLIC_APP_NAME` | Display name shown in the UI |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

### 3. Set up the database

```bash
npm run db:push
```

This creates all tables defined in `prisma/schema.prisma`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. First-time setup

1. Visit the homepage — you'll see **Create Owner Account**
2. Create the single Owner account (this option disappears permanently after creation)
3. Share the app URL with friends so they can **Create account** as normal users

## GitHub Setup

### Push to a new repository

```bash
git init   # if not already initialized
git add .
git commit -m "Phase 1: foundation, auth, and navigation"
git branch -M main
git remote add origin https://github.com/<your-username>/world-cup-fantasy-draft.git
git push -u origin main
```

> **Note:** `.env.local` is gitignored. Never commit secrets.

## Vercel Deployment

### Connect GitHub to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no custom build settings needed
4. Add environment variables in **Project Settings → Environment Variables**:

| Variable | Production Value |
|----------|-----------------|
| `DATABASE_URL` | Your production PostgreSQL URL |
| `AUTH_SECRET` | Same secret you generated locally (or a new one for production) |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `World Cup Fantasy Draft` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

5. Deploy — Vercel runs `npm run build` automatically on each push to `main`

### Database on Vercel

Recommended options:

- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** — integrated with Vercel dashboard
- **[Neon](https://neon.tech)** — serverless Postgres with generous free tier
- **[Supabase](https://supabase.com)** — Postgres + optional extras

After creating your production database, run migrations:

```bash
DATABASE_URL="your-production-url" npm run db:push
```

Or use Prisma Migrate for production:

```bash
npm run db:migrate
```

### Updating the app

Push commits to GitHub — Vercel automatically rebuilds and deploys.

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database models (players, matches, bets, etc.)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register, create-owner
│   │   ├── (app)/             # Protected app pages
│   │   │   ├── my-team/       # Team, rankings, draft, powers
│   │   │   ├── predictions/   # Tournament & match predictions
│   │   │   ├── bets/          # Bets & punishments
│   │   │   ├── calendar/      # Calendar & games
│   │   │   ├── profile/       # User dashboard
│   │   │   └── owner/         # Owner-only admin dashboard
│   │   └── api/auth/          # Auth.js API routes
│   ├── components/
│   │   ├── auth/              # Login & registration forms
│   │   ├── layout/            # App shell, navigation, sub-tabs
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── actions/           # Server actions
│   │   ├── auth/              # Auth config & permissions
│   │   ├── db/                # Prisma client
│   │   └── validations/       # Zod schemas
│   └── middleware.ts          # Route protection & RBAC
├── .env.example
└── README.md
```

## Account Types

### Owner (single account)

- Only one Owner can ever exist — enforced at database and application level
- "Create Owner Account" disappears permanently after the first Owner is created
- Owner routes (`/owner/*`) are protected by middleware and server-side checks
- Normal users never see Owner navigation or tools

### Normal User

- Registers with email, username, **team name**, and **selected nation**
- Participates in the competition (draft, predictions, bets — Phase 2+)
- Cannot edit official tournament data

## Phase 1 vs Phase 2

| Phase 1 (current) | Phase 2 (planned) |
|-------------------|-------------------|
| Auth & RBAC | Draft & redraft mechanics |
| Database schema | Fantasy scoring calculations |
| Navigation & empty pages | Owner data entry UI |
| Owner/user registration | Betting system |
| Protected routes | Predictions scoring |
| Responsive layout | Live rankings & powers |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## License

Private project — not for public distribution.
