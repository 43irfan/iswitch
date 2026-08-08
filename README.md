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

# 4) Prisma client + migrate
pnpm db:generate
pnpm db:migrate

# 5) Dev (API :3001, Web :3000)
pnpm dev
```

## Workspace layout

```text
apps/api          NestJS API + Prisma + workers stubs
apps/web          Next.js portals
packages/shared   Shared Zod schemas / constants
Plan.md           Living product plan (not code docs)
```

## Phase

**Phase 1 — Foundation** (current): runnable shell.  
Auth, retail PBX, wholesale, and billing come in later phases (see `Plan.md`).
