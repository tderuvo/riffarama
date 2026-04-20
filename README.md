# Riffarama 🎸

> Paste a YouTube URL. Paste ChordPro. Tap to sync. Play anytime.

Riffarama is a lightweight web app that lets you sync ChordPro chord sheets to any YouTube video, then play them back karaoke-style with chords and lyrics highlighted in real time.

---

## Setup

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

`.env` is pre-configured for local SQLite (`DATABASE_URL="file:./dev.db"`). No changes needed for local dev.

For production, set `NEXT_PUBLIC_BASE_URL` to your deployment URL so share links resolve correctly:

```env
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

---

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page + recent jams (from localStorage) |
| `/create` | Jam creation, sync mode, playback mode |
| `/jam/[id]` | Permanent saved jam (server-rendered, noindex) |
| `/demo` | Preloaded demo jam |

---

## How it works

### Local save (`lib/storage.ts`)

Recent jams are stored in `localStorage` under the key `riffarama_jams` as a JSON array of up to 20 `Jam` objects. No login required. Data lives in the browser. The landing page reads this on mount via the `RecentJams` client component.

### Permanent share links (`app/api/jams/route.ts`)

Clicking **Save & Get Link** POSTs the jam to `/api/jams`, which creates a record in SQLite via Prisma and returns a random 16-char hex ID. The resulting URL `/jam/[id]` is a server-rendered page that fetches from the DB and renders the jam immediately. Links are unlisted (noindex, nofollow) — no discovery or browse pages exist.

---

## Data model

```ts
type Jam = {
  id: string;          // 16-char hex (crypto.randomUUID derived)
  title: string;
  videoId: string;     // YouTube video ID
  youtubeUrl: string;
  chordPro: string;    // raw ChordPro text
  timings: { index: number; time: number }[];  // line index → video seconds
  createdAt: string;
  updatedAt: string;
};
```

Timings are stored as JSON in the SQLite `timings` column.

---

## Sync mode

1. Load a YouTube URL + ChordPro and click **Load Jam**
2. Press **Play** on the YouTube video
3. Hit **Space** as each lyric line begins — this stamps the current video timestamp to that line
4. Repeat until all lines are synced
5. Click **Play Jam** to enter playback mode

Keyboard shortcuts during sync:

| Key | Action |
| --- | --- |
| `Space` | Sync next line |
| `Z` | Undo last sync |
| `R` | Reset all timings |
| `←` | Jump back 5 seconds |
| `P` | Toggle play/pause |

---

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** + **SQLite** (local) — swap `DATABASE_URL` for Postgres/PlanetScale for production
- **YouTube IFrame API** (official embed, no re-streaming)
- **localStorage** for recent jams

---

## Deploy

### Vercel

```bash
vercel deploy
```

Add `DATABASE_URL` pointing to a Postgres or Turso database. SQLite works locally but not on serverless edge functions.

### Netlify

Works with `@netlify/plugin-nextjs`. Same DB caveat — use a remote DB for persistence.

---

## Seed / demo

A prebuilt demo jam lives at `/demo` using "House of the Rising Sun" with pre-set timings. To seed a jam into the local DB for testing:

```bash
node -e "
const { PrismaClient } = require('./app/generated/prisma/client');
const db = new PrismaClient();
db.jam.create({ data: {
  id: 'demo00000000001',
  title: 'House of the Rising Sun',
  videoId: 'O-zpOMYRi0w',
  youtubeUrl: 'https://www.youtube.com/watch?v=O-zpOMYRi0w',
  chordPro: '{title: House of the Rising Sun}\n\n[Am]There is a [C]house in [D]New Or-[F]leans',
  timings: '[]'
}}).then(() => { console.log('seeded'); db.\$disconnect(); });
"
```
