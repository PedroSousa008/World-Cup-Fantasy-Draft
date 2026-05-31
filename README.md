# World Cup Fantasy Draft

A private World Cup Fantasy Draft web application — built for friends, rivalries, banter, betting, and competition throughout the entire tournament.

**Phase 1 Foundation** — database, authentication, owner/user accounts, navigation, and empty page shells. Fantasy calculations, draft mechanics, betting logic, and prediction scoring come in later phases.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js v5** (credentials auth)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your database URL and a secure `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

4. Push the database schema and seed defaults:

```bash
npm run db:push
npx tsx prisma/seed.ts
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First-Time Setup Flow

1. **Create Owner Account** — On first visit, the login page shows a one-time "Create Owner Account" link. Once created, this option permanently disappears.
2. **Owner configures the platform** — Add players, teams, matches, scoring rules, etc. via Owner Mode (`/owner`).
3. **Friends register** — Users create accounts with a team name and nation at `/register`.

## Account Types

| Role | Description |
|------|-------------|
| **Owner** | Single administrator. Manages all tournament data. Access via Owner Mode only. |
| **User** | Normal participant. Team name + nation required at registration. |

## Navigation Structure

### User Tabs

1. **My Team** — Team, Rankings, Draft Room, Powers
2. **Predictions** — Tournament, Match, Ranking
3. **Bets & Punishments** — Bets, Punishments
4. **Calendar** — Events, Games
5. **Profile** — Personal dashboard

### Owner Mode

- Dashboard, Players, National Teams, Matches, Scoring, Betting, Rewards & Punishments, Calendar

## Database Models

Core models defined in `prisma/schema.prisma`:

- Auth: `User`, `Account`, `Session`, `PlatformSettings`
- Tournament: `NationalTeam`, `Player`, `Match`, `MatchEvent`
- Fantasy: `FantasyTeam`, `Draft`, `DraftPick`, `Power`, `UserPower`
- Competition: `Prediction`, `TournamentPrediction`, `Bet`, `Reward`, `Punishment`
- Meta: `CalendarEvent`, `ScoringRule`, `Achievement`, points snapshots

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

## What's Next (Phase 2+)

- Owner CRUD for players, teams, and matches
- Fantasy point calculation engine
- Draft room mechanics
- Betting system logic
- Prediction scoring
- Powers/cards activation
- Live rankings and real-time updates
