# iSwitch

Class 5 softswitch control plane: multi-role portals + app database, synced to Asterisk.

> Product plan lives in [`Plan.md`](./Plan.md) (plan only — not application docs).

## Stack

| Layer | Tech |
|-------|------|
| API | NestJS (`apps/api`) |
| Portals | Next.js (`apps/web`) |
| Shared | `@iswitch/shared` |
| DB | PostgreSQL + Prisma |
| Jobs | Redis + BullMQ |
| Telephony | Asterisk (ARI / Realtime / AMI) |

## Quick start

```bash
# 1) Redis (if not already running locally)
docker compose up -d redis
# Postgres: use your local instance (db=iswitch, user/pass=postgres/postgres)

# 2) Install
pnpm install

# 3) Env (API already expects local Postgres credentials)
cp .env.example apps/api/.env
# Ensure DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iswitch?schema=public

# 4) Prisma client + migrate + seed
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5) Dev (API :3001, Web :3000)
pnpm dev
```

Demo logins (password `Password123!`):
`admin@iswitch.local`, `reseller@iswitch.local`, `retail@iswitch.local`, `wholesale@iswitch.local`, `user@iswitch.local`

## Workspace layout

```text
apps/api          NestJS API + Prisma + workers
apps/web          Next.js portals
packages/shared   Shared Zod schemas / constants
Plan.md           Living product plan (not code docs)
```

## Phase status

**Phase 6 — Hardening** (current): audit log, destination fraud blocks, health/readiness, login rate limits, sync retry/error handling, admin ops UI.

Earlier: foundation → auth/tenancy → retail PBX → wholesale → billing (see `Plan.md`).

### Useful endpoints

| Path | Notes |
|------|--------|
| `GET /health` | DB + Redis check |
| `GET /health/live` | Liveness only |
| `GET /ops/ready` | Readiness (public) |
| `GET /ops/overview` | Admin ops dashboard data |
| `POST /billing/cdrs/ingest` | CDR ingest (`X-CDR-Token` / `CDR_INGEST_TOKEN`) |
