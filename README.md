# Patiently

A real-time patient registration web app. Patients fill out a self-check-in form on one device; staff see every keystroke, submission, and drop-off live on another.

Two pages, one Firebase Realtime Database, zero polling.

- **`/`** — Patient registration form (auto-saves every 300 ms)
- **`/staff`** — Live dashboard of every in-flight and submitted session

## Live

- Patient: https://patiently.lightningshot.co
- Staff: https://patiently.lightningshot.co/staff

Hosted on Vercel, domain on Cloudflare DNS → Squarespace registrar.

---

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | [Bun](https://bun.sh) 1.3+ (enforced via `preinstall` hook) |
| Framework | Next.js 15 App Router + React 19 |
| Realtime sync | Firebase Realtime Database (not Firestore) |
| Validation | [ArkType](https://arktype.io) 2.x (per-field on blur) |
| Styling | Tailwind CSS v4 (PostCSS pipeline, no config file) |
| Unit tests | `bun test` |
| E2E tests | Playwright (Chromium, serial, shared Firebase project) |

---

## Prerequisites

- **Bun 1.3+** — `npm`/`pnpm`/`yarn` are blocked by the `preinstall` script.
- **A Firebase project** with **Realtime Database** enabled (Singapore or Asia-Southeast region recommended for low RTT).

---

## Setup

```bash
bun install
cp .env.example .env.local
# Open .env.local and paste your Firebase web config
bun dev
```

Open http://localhost:3000 for the patient form and http://localhost:3000/staff for the dashboard.

> **Node 25 users:** the `dev` script sets `NODE_OPTIONS=--localstorage-file=.next/localstorage.json` to work around Node's experimental WebStorage API conflicting with Next.js's DevOverlay during SSR.

---

## Scripts

| Command | What it does |
|---------|--------------|
| `bun dev` | Start the Next.js dev server on :3000 |
| `bun run build` | Production build (SSR regression guard) |
| `bun start` | Serve the production build |
| `bun test src` | Run unit tests (scoped — avoids Playwright `.spec.ts`) |
| `bun test:e2e` | Run Playwright E2E suite against `localhost:3000` |
| `bun test:e2e:prod` | Run Playwright E2E suite against `https://patiently.lightningshot.co` |
| `bun test:all` | Unit + E2E |

---

## How the realtime loop works

```
Patient types  ──►  300 ms debounce  ──►  RTDB write (status: filling)
                                            │
                                            ▼
                                     Staff page onValue()
                                            │
                                            ▼
                                     Card updates live
```

- **Inactivity:** after 30 s idle, the client flips the session to `inactive`.
- **Browser close / network drop:** Firebase's server-side `onDisconnect()` hook flips the session to `inactive` — no client heartbeat required.
- **Submission:** `onDisconnect()` is cancelled before writing `submitted`, so a subsequent reload can't silently downgrade the status.
- **Ghost-session filter:** an inactive session with zero filled fields is hidden from the staff view.
- **Resume:** `sessionStorage` keeps the session ID per tab; reloading continues where the patient left off.

---

## Data model

```
sessions/{sessionId}
  ├─ id: string (uuid)
  ├─ status: "filling" | "submitted" | "inactive"
  ├─ createdAt: ISO string
  ├─ lastActivityAt: ISO string
  └─ formData: { firstName, lastName, dateOfBirth, ... }
```

9 required fields, 4 optional (middle name, religion, emergency contact name + relationship). Emergency contact is validated as a group: both or neither.

---

## CI

`.github/workflows/ci.yml` runs three layers in sequence:

1. **Build** — with placeholder Firebase env, catches SSR regressions.
2. **Unit** — `bun test src`.
3. **E2E** — Playwright against the real Firebase project.

The E2E job needs these repository secrets:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Project layout

```
src/
├─ app/            # Next.js App Router pages (/, /staff)
├─ components/
│  ├─ patient/     # Form sections + SuccessScreen
│  ├─ staff/       # SessionCard, StatusIndicator, EmptyState
│  └─ ui/          # FormField, CustomSelect
├─ hooks/          # usePatientForm, useStaffView
├─ lib/            # firebase (lazy singleton), session, validation
└─ types/          # PatientSession, PatientSessionStatus
tests/e2e/         # Playwright specs
```
