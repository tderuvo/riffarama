'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { YouTubePlayer, YouTubePlayerHandle } from '@/components/YouTubePlayer';
import { PlaybackView } from '@/components/PlaybackView';
import { parseChordPro } from '@/lib/chordpro';
import type { SyncedLine } from '@/types/jam';

// Sample: "House of the Rising Sun" (traditional / public domain) — Animals-style cover
const DEMO_CHORD_PRO = `{title: House of the Rising Sun}
{artist: Traditional}

{soc}
[Am]There is a [C]house in [D]New Or-[F]leans
They [Am]call the [C]Rising [E]Sun
And it's [Am]been the [C]ruin of [D]many a poor [F]boy
And [Am]God I [E]know I'm [Am]one
{eoc}

{soc}
[Am]My [C]mother was a [D]tailor [F]
She [Am]sewed my [C]new blue [E]jeans
My [Am]father was a [C]gambling [D]man [F]
Down in [Am]New Or-[E]leans [Am]
{eoc}

{soc}
[Am]Now the [C]only thing a [D]gambler [F]needs
Is a [Am]suitcase [C]and a [E]trunk
And the [Am]only time he's [C]satis-[D]fied [F]
Is when he's [Am]on a [E]drunk [Am]
{eoc}`;

// Pre-built timings synced to The Animals' original (approximated for demo)
// Indices match the lyric lines in DEMO_CHORD_PRO (0-based, counting all lines including
// {title}, {artist}, blank, and {soc}/{eoc} directives)
const DEMO_TIMINGS: SyncedLine[] = [
  { index: 4,  time: 14 },  // There is a house in New Orleans
  { index: 5,  time: 17 },  // They call the Rising Sun
  { index: 6,  time: 21 },  // And it's been the ruin of many a poor boy
  { index: 7,  time: 25 },  // And God I know I'm one
  { index: 11, time: 29 },  // My mother was a tailor
  { index: 12, time: 32 },  // She sewed my new blue jeans
  { index: 13, time: 36 },  // My father was a gambling man
  { index: 14, time: 40 },  // Down in New Orleans
  { index: 18, time: 44 },  // Now the only thing a gambler needs
  { index: 19, time: 47 },  // Is a suitcase and a trunk
  { index: 20, time: 51 },  // And the only time he's satisfied
  { index: 21, time: 55 },  // Is when he's on a drunk
];

// The Animals — House of the Rising Sun (official)
const DEMO_VIDEO_ID = 'N4bFqW_eu2I';

export default function DemoPage() {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const lines = parseChordPro(DEMO_CHORD_PRO);

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← Riffarama
          </Link>
          <h1 className="text-white font-semibold">Demo — House of the Rising Sun</h1>
          <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
            Demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((f) => (f === 'normal' ? 'large' : 'normal'))}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
          >
            {fontSize === 'normal' ? 'Aa' : 'AA'}
          </button>
          <Link
            href="/create"
            className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
          >
            + New Jam
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
          <strong>Demo mode:</strong> Press play on the video — chords and lyrics will highlight in sync.
          The timings are pre-set for this demo.{' '}
          <Link href="/create" className="underline hover:text-amber-200">
            Create your own jam →
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <YouTubePlayer ref={playerRef} videoId={DEMO_VIDEO_ID} />
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Live Playback
              </h2>
            </div>
            <PlaybackView
              lines={lines}
              timings={DEMO_TIMINGS}
              playerRef={playerRef}
              fontSize={fontSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
