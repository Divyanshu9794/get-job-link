# GetJobLink

A smart job aggregation and application platform. Users explore aggregated tech/software job postings, view detailed job pages with an ATS resume-builder, apply officially via source ATS, and manage their profile; admins ingest jobs from multiple authorized sources via a normalize-dedupe pipeline.

> Stack: Vite + React 19 (client) + Firebase Cloud Functions (Node 24, ESM, Firebase SDK v7) + Firestore + @google/genai.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Data Model & Adapters](#data-model--adapters)
3. [Firestore Layout & Security](#firestore-layout--security)
4. [Folder Structure](#folder-structure)
5. [Functions Overview](#functions-overview)
6. [Client Pages](#client-pages)
7. [Environment Variables](#environment-variables)
8. [Running Locally](#running-locally)
9. [Deployment](#deployment)
10. [Adding a New Job Source](#adding-a-new-job-source)
11. [Source Status & Legal Compliance](#source-status--legal-compliance)
12. [Troubleshooting](#troubleshooting)

---

## Architecture

```
Source → Fetch → Normalize → Deduplicate → Enrich → Store → Match → Display
```

- **Fetch** — a `fetch*` function per source hits the legitimate endpoint (official API, authorized feed, or user-submitted UR) and returns the raw source listing.
- **Normalize** — the result of the fetch is passed through a normalizer specific to that source to produce the **normalized job model** (`NormalizedJob`) shared across all sources.
- **Deduplicate** — a Fuzzy Match + phonetic (Soundex/Metaphone) pass, using an existing index (`/<normalized>indexes/<committee>/<hash>.json`), is run against previously stored signatures. Auto-duplicates get skipped; possible duplicates go to the admin queue.
- **Enrich** — ATS Analyzer keywording (matching against candidate's `skills`, `keywords`, `preferredRoles`, `techStack`), **Source**-part preservation, and the missing Adcash ad-cache toggle are applied here.
- **Store** — dispatched to the `jobs` collection (via `functions/jobs.js`) and `job/explore` (client) with admin monitoring.
- **Match** — the `job/${id}/matches` (FoundationMatch) and `[Apply Officially]` deep-link to the source ATS with ATS stats (match %, skills, keywords) aggregated for each job post.
- **Display** — Explore Opportunities (new jobs, recommended, profile match %, source, posted time, remote/onsite, experience, skills, filters, search) plus `[Apply Officially]` and admin pipelines.

> **Ad-cache:** the ad-cache toggle is maintained but off by default as a safety measure.

## Data Model & Adapters

### Source adapter contract

Every source lives in its own module under `functions/src/adapters/`. Each adapter exports two functions:

- `fetchSource*()` → raw source listing (paginated fetch where required)
- `normalizeSource*(i)` → one entry from the raw listing, returns a `NormalizedJob`

### Normalized job model

```ts
interface NormalizedJob /* src/adapters/normalize.js */ {
  id: string;                       // normalized hash ID
  title: string;
  company: string;
  location: string;                 // displayed location e.g. "Remote — India"
  remote: boolean;                  // derived from location and explicit field
  postedAt: string;                 // ISO timestamp
  source: string;                   // source label (Greenhouse, LinkedIn, …)
  sourceId: string;                 // original source job ID
  url: string;                      // canonical apply URL
  applyUrl: string;                 // source ATS apply URL (for [Apply Officially])
  logo: string;                     // company logo URL
  description: string;              // full description (HTML)
  requirements: string[];           // parsed from description
  skills: string[];                 // populated by ATS Analyzer
  keywords: string[];               // matched against candidate profile
  experience: { min: number; max: number | null };  // in years
  employmentType: string;           // Full-time / Part-time / Contract…
  salary: { currency: string; min: number; max: number } | null;
  tags: string[];                   // curated tags
}
```

Base normalizer: `functions/src/adapters/normalize.js` — shared logic for source/apply-URL de-duplication, job ID hashing, and date handling. Source-specific normalizers extend it.

### Implemented adapters

| Adapter | File | Notes |
| --- | --- | --- |
| Greenhouse | `functions/adapters/greenhouse.js` | promotes `jobs[].abs_company` when `company` is empty, applies `postedAt` from `updated_at` when `live:false`, keeps `abs_company`-style logo |
| Adcash | `functions/adapters/adcash.js` | official adbpage script; job title + URL only (title ending `- Remote` drops to (  `_RemoteSuffix`) |
| LinkedIn | `functions/adapters/linkedin.js` | `guestViralReferrerJobPostingsSearchResults` drive; placeholder — requires LinkedIn official/enterprise/partner API approval |

> **Important:** no adapter for Naukri (API was discontinued; no authorized feed exists) — excluded entirely.

## Firestore Layout & Security

### Layout

```
/jobs/{jobId}
  ├─ id, title, company, location, remote, postedAt, source, sourceId,
  │  url, applyUrl, logo, description, requirements, skills, keywords,
  │  experience, employmentType, salary, tags, createdAt (admin)
/job/{jobId}/matches/{position_id}   (FoundationMatch; hidden from Explore)
/admin/meta/latest                    (lastSyncAt, counts, status)
/admin/jobs/{jobId}                   (admin review queue)
```

### Security rules (firestore.rules)

- **Public read** for `/jobs/**` and `/job/**/matches/**` — jobs are read-only JSON.
- **Public write write NOT enabled** — writes are gated to Cloud Functions with an auth header.
- **Admin config** — all `admin` writes are locked behind `request.auth != null && request.auth.token.email_verified == true`.
- Functions write Firestore via `firebase-admin` and the onRequest CORS proxy (port 5173) reads via **Firestore REST**, bypassing Cloud Functions entirely (public read).

## Folder Structure

```
get-job-link/
├─ functions/
│  ├─ index.js            # onRequest entry; optional firebaseAuth CORS
│  ├─ jobs.js             # normalizer dispatch + dedupe + Firestore store
│  ├─ bot.js              # ad-serving / bot-traffic handling
│  ├─ adapters/
│  │  ├─ index.js         # adapter registry + init (per-view fetch; no top-level side effects)
│  │  ├─ normalize.js     # NormalizedJob base, ID hash, source/apply URL helpers
│  │  ├─ greenhouse.js    # Greenhouse v1 board adapters
│  │  ├─ adcash.js        # adbpage official script
│  │  └─ linkedin.js      # LinkedIn (placeholder — requires approval)
│  ├─ package.json        # ESM, Node 24, firebase-functions v7
│  └─ .env                # (only if needed) GEMINI_API_KEY, secrets
├─ src/
│  ├─ main.jsx            # React root, routing, HelmetProvider, FirestoreProvider
│  ├─ index.css           # Tailwind v4 (default layer)
│  ├─ firebase.js         # Firebase v11 compat init, analytics, firestore
│  ├─ utils/________           # client Analytics object (not needed for CDN)
│  ├─ pages/
│  │  ├─ HomePage.jsx     # landing page
│  │  ├─ JobListPage.jsx  # Explore Opportunities
│  │  ├─ JobDetailPage.jsx# job detail + [Apply Officially]
│  │  ├─ AdminPage.jsx    # admin
│  │  └─ ResumeBuilder.jsx# ATS resume builder / manager
│  ├─ App.jsx             # Application (optional; single-page UI)
│  ├─ main copy.jsx       # backup entry (delete when no longer needed)
│  ├─ App.css
│  └─ firebaseConfig.js   # public client config
├─ public/
│  ├─ atsevaluator.js     # ats linker
│  ├─ adcash-min.js       # adcash cached copy (ad-cache toggle)
│  └─ card_carausel.js    # (unused; card carousel source)
├─ index.html
├─ firebase.json
├─ .firebaserc
├─ firestore.rules
└─ package.json
```

## Functions Overview

| Function | File | Purpose |
| --- | --- | --- |
| `jobs.ingest` | `functions/jobs.js` (api) | Fetch → Normalize → Dedupe → Enrich → Store. |
| `jobs.list` | `functions/jobs.js` (api) | Explore queries with pagination, filter (remote/experience/source), search, and "recommended" cursor. |
| `jobs.id` | `functions/jobs.js` (api) | Job detail + `matches` fetch. |
| `iterativeSearch` | `src/jobs.js` (FileSystemEntry — searchable) | re-search for older matches |
| `fetchAdcash` / proxy | `functions/index.js` | `adbpage` official script proxy (CORS) |

## Client Pages

- **HomePage** — hero, value props, CTA to `/explore`.
- **JobListPage** — Explore Opportunities: new jobs, recommended, profile match % (job/explore + job/`${id}`/matches), source, posted time, remote/onsite, experience, skills, filters, search, `[Apply Officially]`.
- **JobDetailPage** — job detail, ATS match, matches skill list, `[Apply Officially]` deep link.
- **ResumeBuilder** — resume upload, **ATS parse**, `.txt` and `.json` resume support.
- **AdminPage** — admin.
- **App.jsx** — application (optional); single-page UI.

## Environment Variables

### Client (`src/__config.js` or Vite `IMPORT_META_ENV`)

| Var | Purpose |
| --- | --- |
| `VITE_FIREBASE_APIKEY` | Firebase Web API key (public) |
| `VITE_FIREBASE_AUTHDOMAIN` | `https://<project>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECTID` | Project ID |
| `VITE_FIREBASE_STORAGEBUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APPID` | Web app ID |
| `VITE_FUNCTIONS_URL` | `http://127.0.0.1:5001/<project>/us-central1` (local) |
| `VITE_GEMINI_BROWSER_KEY` | optional @google/genai browser key (client auth) |

### Server / functions (Firebase Environment)

| Var | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | @google/genai server-side (build-time else dynamic). `FUNCTIONS_EMULATOR` env not needed. |
| `FIREBASE_SERVICE_ACCOUNT` | service-account credentials (JSON, base64) |
| The ad-cache fetch is toggled by `AD_CACHE_ENABLED` (defaults off). |

## Running Locally

```bash
git clone <repo> && cd get-job-link
npm install && npm install --prefix functions && npm install --prefix functions
firebase login
# the functions/src adapters run in a sandbox "firebase" SDK — no emulator needed
firebase emulators:start --only functions
# work in a separate terminal:
npm run dev
```

Default ports: Vite 5173 → Firebase Functions (via Firestore REST) → Firestore.

## Deployment

```bash
firebase deploy --only functions
firebase deploy --only hosting
```

Client is compiled with Vite (npm run build) and served as Firebase Hosting; functions are deployed via `functions` (ESM, Node 24).

## Adding a New Job Source

1. **Add an adapter module** under `functions/adapters/` that exports `fetchSource*()` over the raw listing and `normalizeSource*(i)` returning a `NormalizedJob`.
2. **Register** it in `functions/adapters/index.js` adapter registry (map of source → adapter object).
3. **Add a test hook** in the same module if desired (export `fetchSource*` for local testing against the real endpoint).
4. **Verify** locally:
   ```bash
   node functions/src/adapters/<source>.js
   ```
   It makes a real network call; do not commit credentials.
5. **Deploy** and re-run: `npm --prefix functions run build` then `firebase deploy --only functions`.
6. In the admin panel, ingested sources are shown with source badge; generated pills show **ATS** (match %), **Skills** and **Experience** tags.

> ⚠️ **ATS renderer is complete on all pages.** Notes: requirement 10 — `fetchAdcash` renders ad-cache toggle content on the ABOUT page only; requirement 6 — @google/genai (Gemini) is used for ATS keywording of the built-in Anywhere catch-all default skill match.

## Source Status & Legal Compliance

- **Greenhouse** — official public API (api.greenhouse.io) — fast onboarding path, no approval needed to pull public job postings.
- **Adcash** — official adbpage /third-party-publisher script; you must be an Adcash partner to legitimately use it as a publisher. Approve via webhook. Toggle `AD_CACHE_ENABLED`.
- **LinkedIn** — guest scrape (guestViralReferrerJobPostingsSearchResults) currently placeholder's drive; needs official API approval before real integration.
- **No Naukri** — the Naukri public API was discontinued; no authorized feed exists.

## Troubleshooting

- **CORS failure in frontend**: make sure the `onRequest({ cors: true })` wrapper is preserved and `cors` handlers don't swallow errors; in emulator the proxy + Firestore REST both bypass functions.
- **Firestore "No document" on read**: jobs are served via Firestore REST public read; check rules (`firestore.rules`) that `/jobs/**` is readable and that writes are gated behind functions.
- **Fuzzy-match dedupe never fires**: verify the `/<normalized>indexes/<committee>/<hash>.json` signature index exists and `hash` matches the commit. Default to no-cache (fresh index) unless in production.
- **Duplicate ad-cache**: ad-cache toggle should be off (safety); if on and you see doubled jobs, disable it.
