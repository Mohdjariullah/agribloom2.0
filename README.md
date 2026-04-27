
# 🌾 AgriBloom 2.0 — Detailed README

This document is an exhaustive, practical guide for developers and maintainers working with AgriBloom 2.0. It covers the project's purpose, architecture, environment variables, local development steps, seed data, deployment notes, API shape, troubleshooting, and recommended next steps.

--

**Table of contents**
- **Overview**
- **Key features**
- **Architecture & folder layout**
- **Prerequisites**
- **Environment variables (explained)**
- **Local setup (step-by-step)**
- **Database & seed scripts**
- **Development scripts**
- **API routes and key endpoints**
- **LLM/chat integration**
- **Testing, linting, formatting**
- **Deployment**
- **Troubleshooting & common issues**
- **Contributing & code style**
- **Security & secrets**
- **Contact and credits**

--

**Overview**

AgriBloom 2.0 is a Next.js TypeScript application that aggregates agronomic information, pest management guidance, pricing data, and farmer-facing dashboards to help agricultural stakeholders make better pre-sowing decisions. It bundles UI components, server API routes, seeding utilities, and integrations with external providers (weather, mandi price sources, and an LLM chatbot for conversational help).

**Key features (high level)**
- **Farmer/Admin auth**: JWT + email verification + role-based access controls.
- **AgriLens**: Rich crop profiles (soil, water, sowing windows, images, benefits).
- **Pests & Insects**: Catalog with treatments and severity guidance.
- **Mandi / Price data**: Integrations for fetching state/district prices and caches.
- **Farmer dashboard**: Submit pre-sowing entries, view trends & charts.
- **Chatbot**: LLM-powered chat (configurable API key) for advisory interactions.

**Architecture & folder layout** (summary of what's most useful)
- **app/** — Next.js App Router pages, server components, and route handlers.
- **src/app/api/** — API route implementations used by the frontend (uploads, chat, commodities, crops, users, weather, etc.).
- **scripts/** — Standalone TypeScript seed scripts: seedCrops.ts, seedPests.ts, seedSchemes.ts, seedAdmin.ts (run with `npm run seed:*`).
- **dbConfig/** — MongoDB connection helpers.
- **models/** — Mongoose schema files (Crop, Pest, MandiPriceCache, GovtScheme, CropEntry, etc.).
- **lib/** — Helper libraries (agmarknet, csv parsing, utils).
- **components/** — Reusable React components and UI primitives.

Refer to the repository tree in the workspace root for the complete structure.

--

Prerequisites
- Node.js 20+ (tested with Node 20/22). Use nvm or your OS package manager to install.
- npm (8+) or pnpm/yarn (if you adapt commands)
- A MongoDB database (Atlas recommended for development and production)
- Optional: Vercel account for deployment

--

Environment variables (explain each)

Copy `.env.example` to `.env.local` (or create `.env` in root). The repository includes `.env.example` at the project root.

Important variables and their purpose:
- MONGODB_URI: MongoDB connection string (Atlas recommended). Example: mongodb+srv://<user>:<pass>@cluster.mongodb.net/agribloom
- TOKEN_SECRET: Secret used to sign JWT tokens. Generate securely (openssl rand -base64 48).
- ADMIN_SECRET_KEY: Required to register an admin account (used by signup flow).
- RESEND_API_KEY and RESEND_FROM_EMAIL: If using Resend to send verification emails.
- DOMAIN: Public origin used in verification links (e.g., http://localhost:3000 for local dev).
- DATA_GOV_API_KEY: (optional) key for AGMARKNET / mandi APIs.
- OPENWEATHER_API_KEY: (optional) OpenWeatherMap for weather information.
- GOOGLE_GEMINI_API_KEY: (optional) key for LLM chat integration.
- NEXT_PUBLIC_APP_URL: Public app URL exposed to the frontend.
- NODE_ENV: development | production

Store these secrets securely in your hosting provider and never commit real values to source control. Use `.env.local` for local-only variables and add it to .gitignore.

--

Local setup (step-by-step)

1) Clone

```bash
git clone https://github.com/Mohdjariullah/agribloom2.0.git
cd agribloom2.0
```

2) Install dependencies

```bash
npm install
```

3) Create environment file

```bash
cp .env.example .env.local
# Edit .env.local and fill the values (MONGODB_URI, TOKEN_SECRET, DOMAIN, etc.)
```

4) Seed the database (optional but recommended for local testing)

The project includes seed scripts. Run the seeds after setting MONGODB_URI and other envs.

```bash
npm run seed:crops     # load crop catalog
npm run seed:pests     # load pest catalog
npm run seed:schemes   # load government schemes
npm run seed:admin     # create an admin account (inspect script for required values)
npm run seed:all       # runs crops + pests + schemes
```

5) Run the dev server

```bash
npm run dev
# Open http://localhost:3000
```

6) Build & run production locally (optional)

```bash
npm run build
npm run start
```

--

Development scripts (from package.json)
- **dev**: `npm run dev` — start Next.js in dev mode (with Turbopack as configured).
- **build**: `npm run build` — build for production.
- **start**: `npm run start` — run the built app.
- **lint**: `npm run lint` — run ESLint using Next's config.
- **seed:crops|seed:pests|seed:schemes|seed:admin|seed:all** — seed scripts implemented in `scripts/` and executed with tsx.

--

Database & seed scripts (details)

- The app uses MongoDB via Mongoose. Connection helper: `dbConfig/dbConfig.ts`.
- Models are in `models/` and represent domain objects (Crop, Pest, MandiPriceCache, GovtScheme, CropEntry, etc.).
- Seed scripts are TypeScript files in `scripts/`. They are invoked via `tsx` in package.json and expect `MONGODB_URI` to be set.
- If a seed script fails, examine the stack trace and ensure the DB credentials are correct and network access (Atlas IP allowlist) permits your machine.

--

API routes and significant endpoints (server-side)

The project follows Next.js App Router conventions: API routes live under `src/app/api/`.
Key route folders include:
- api/chat — LLM/chat endpoints used by the interactive chatbot.
- api/crops — crop CRUD and search utilities.
- api/pests — pest catalog endpoints.
- api/mandi-prices, mandis-data, mandis-list — mandi/price data retrieval and caching.
- api/users — auth, signup, email verification, password resets.
- api/upload — file/image upload handler used by some admin flows.

Always check the handlers in `src/app/api/*` for exact request/response shapes and required authentication headers (some admin routes require JWT + role checks).

--

LLM / Chat integration

- The chat backend (api/chat) can use the Google Gemini key (GOOGLE_GEMINI_API_KEY) with the included integration `@google/generative-ai`.
- By default the chat routes will be disabled or return a helpful message if no key is configured. For development, stub responses can be used by mocking.

--

Testing, linting & formatting

- ESLint is configured; run:

```bash
npm run lint
```

- TypeScript checks are performed by the Next.js build. Optionally run `tsc --noEmit` if you want explicit type-check runs.

--

Deployment notes

- Vercel (recommended for Next.js) — set environment variables in the Vercel dashboard matching your `.env.local` entries. Use preview deployments for PRs.
- MongoDB Atlas — create a production cluster, secure credentials, and whitelist Vercel IP ranges or use private networking where applicable.
- When deploying, set NODE_ENV=production and ensure you have a robust TOKEN_SECRET and mail API keys configured.

--

Troubleshooting & common issues

- Connection refused to MongoDB: verify MONGODB_URI, network access and Atlas IP allowlist.
- Email sending fails: ensure RESEND_API_KEY is set and RESEND_FROM_EMAIL is valid.
- Seed script errors: check TypeScript runtime `tsx` is installed (it's listed in devDependencies) and your environment variables.
- Chat/LLM errors: missing or invalid GOOGLE_GEMINI_API_KEY will cause chat endpoints to return errors — verify key and quotas.

--

Contributing and coding conventions

- Use the App Router pattern (server components + client components) consistently.
- Follow TypeScript strictness currently used in the codebase.
- Add unit or integration tests for new backend routes where possible.
- Open a PR to `main`, include clear description and testing steps. Use branches named `feat/*`, `fix/*`, or `chore/*`.

--

Security & handling secrets

- NEVER commit `.env.local` or real credentials. `.env.example` is the canonical template to copy from.
- Rotate sensitive keys (TOKEN_SECRET, DB credentials) if you suspect they were exposed.

--

Recommended next steps (for new contributors)
- Fill `.env.local` from `.env.example` and start the dev server.
- Run seed scripts to populate demo data.
- Explore `src/app/api/` for the definitive endpoint shapes, then exercise them with Postman or curl.

--

Contact / credits
- Repository owner and primary maintainer: Mohdjariullah (see repository metadata).
- Project originally assembled to integrate AgriIntel-style features into a single farmer-first dashboard.

--

License
- Check repository root for a LICENSE file. If none is present, contact the maintainer for license terms before redistribution or commercial use.

--
