'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { YouTubePlayer, YouTubePlayerHandle } from '@/components/YouTubePlayer';
import { PlaybackView } from '@/components/PlaybackView';
import { ShareLinkBox } from '@/components/ShareLinkBox';
import { parseChordPro } from '@/lib/chordpro';
import type { Jam } from '@/types/jam';

interface Props {
  jam: Jam;
}

export function JamPlayer({ jam }: Props) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [fullscreen, setFullscreen] = useState(false);

  const lines = parseChordPro(jam.chordPro);
  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : '';

  return (
    <div className={`min-h-screen bg-zinc-950 ${fullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      {/* Header */}
      <header className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {!fullscreen && (
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm shrink-0">
              ← Riffarama
            </Link>
          )}
          <h1 className="text-white font-semibold truncate">{jam.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFontSize((f) => (f === 'normal' ? 'large' : 'normal'))}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
          >
            {fontSize === 'normal' ? 'Aa' : 'AA'}
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
          >
            {fullscreen ? '⊡ Exit' : '⛶ TV Mode'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
          {/* Video */}
          <div className="space-y-4">
            <YouTubePlayer ref={playerRef} videoId={jam.videoId} />
            <ShareLinkBox url={shareUrl || `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/jam/${jam.id}`} />
          </div>

          {/* Playback */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Live Playback
              </h2>
              <span className="text-xs text-zinc-600">
                {jam.timings.length} lines synced
              </span>
            </div>
            <PlaybackView
              lines={lines}
              timings={jam.timings}
              playerRef={playerRef}
              fontSize={fontSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
