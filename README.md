# Site-Serres-Scale — Landing Page Generator

A self-hostable **landing-page generator**: a Next.js app with a login-protected
admin UI that creates, edits, and publishes landing pages, using **Azure OpenAI**
for AI text & image generation.

> 📁 The application lives in **[`landing-generator/`](./landing-generator)**.
> All commands below are run from that folder.

## What it does

- **Public site** — published landings at `/`, `/l/[id]`, `/p/[slug]`, `/[slug]`, plus `/contact` and `/a-propos`.
- **Admin UI** — `/app-admin` (login required): build pages, generate copy & images with AI, publish.
- **Storage** — SQLite (a single file) via Prisma. No external database to provision.

**Stack:** Next.js (standalone) · Prisma + SQLite · Azure OpenAI (text + image) · Docker.

## Prerequisites

1. **Docker** (recommended) — or **Node.js 22** for local development.
2. **An LLM provider**: an **Azure OpenAI** resource (or OpenAI-compatible endpoint) with
   - one **text** model deployment, and
   - one **image** model deployment.

> ℹ️ The app starts without AI keys, but **generation won't work** until you set them.
> This is the **only** external dependency — there is **no lock-in to any hosting account**.

## 1. Configure environment

```bash
cd landing-generator
cp .env.example .env     # then fill in YOUR values
```

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | SQLite path. In Docker it is forced to `file:/home/data/landing.db`; for local dev use `file:./dev.db`. |
| `AZURE_OPENAI_ENDPOINT` | ✅¹ | Your Azure OpenAI endpoint URL. |
| `AZURE_OPENAI_KEY` | ✅¹ | Your Azure OpenAI API key. |
| `AZURE_OPENAI_DEPLOYMENT` | ✅¹ | Name of your **text** model deployment. |
| `AZURE_IMAGE_DEPLOYMENT` | ✅¹ | Name of your **image** model deployment. |
| `AZURE_OPENAI_API_VERSION` | — | API version (default `2024-12-01-preview`). |
| `AUTH_SECRET` | ✅ | Random string ≥ 32 chars — generate with `openssl rand -hex 32`. |
| `ADMIN_USERNAME` | ✅ | Admin login username. |
| `ADMIN_PASSWORD` | ✅ | Admin login password. |
| `ADMIN_SESSION_DAYS` | — | Admin session length in days (default `7`). |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | — | Base URL for external static images. |
| `PORT` / `HOSTNAME` | — | Listen port / interface (default `3000` / `0.0.0.0`). |

¹ Required for AI generation. The annotated template is [`landing-generator/.env.example`](./landing-generator/.env.example).

## 2. Deploy with Docker Compose (recommended)

```bash
cd landing-generator
docker compose up -d --build
```

- App: **http://localhost:3000** · Admin: **http://localhost:3000/app-admin**
- Data persists in the named volume **`landing-data`** (mounted at `/home/data`).
- Update: `git pull && docker compose up -d --build`
- Logs: `docker compose logs -f` · Stop: `docker compose down` (the volume is kept).

## Deploy with plain Docker (no Compose)

```bash
cd landing-generator
docker build -t landing-generator .
docker run -d --name landing-generator \
  -p 3000:3000 --env-file .env \
  -v landing-data:/home/data \
  landing-generator
```

> The container runs Prisma migrations on start and **always uses `/home/data/landing.db`**.
> Always mount a volume at `/home/data`, otherwise data is lost on every restart.

## Local development (no Docker)

```bash
cd landing-generator
npm install
cp .env.example .env          # DATABASE_URL="file:./dev.db" is fine locally
npx prisma migrate deploy     # create / update the local DB schema
npm run dev                   # http://localhost:3000
```

## Admin access

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `AUTH_SECRET` (≥ 32 chars) in `.env`,
then sign in at **`/app-admin`**.

## Data: backup & restore

All content (landings, configurations) is in the SQLite file inside the `landing-data` volume.

- **Backup:** copy `landing.db` out of the volume.
- **Restore / migrate:** place a `landing.db` into the volume before starting the container.

## Hosting on your own infrastructure

This app runs on **any** Docker-capable host — a VPS, the client's server, Render,
Railway, Fly.io, Kubernetes, or any cloud's container service. You provide **a server**
and **your own LLM keys**; nothing ties it to the original hosting.

### CI / auto-deploy

`.github/workflows/master_serres-landing-gen.yml` originally auto-deployed to the
**original owner's** Azure App Service and requires **their** secrets. **Auto-deploy on
push is disabled** (manual trigger only). To automate your own deploys, replace that file
with a pipeline targeting **your** infrastructure.

<details>
<summary>Reference — how the original production was hosted (Azure)</summary>

- Azure App Service `serres-landing-gen` (Linux, Node 22); SQLite at `/home/data/landing.db`.
- Startup: `startup.sh` → `node init-db.js` (creates tables) → `node server.js`.
- You do **not** need any of this to self-host — use the Docker path above.

</details>
