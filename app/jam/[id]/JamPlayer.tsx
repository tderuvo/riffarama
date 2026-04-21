'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { YouTubePlayer, YouTubePlayerHandle } from '@/components/YouTubePlayer';
import { PlaybackView } from '@/components/PlaybackView';
import { parseChordPro } from '@/lib/chordpro';
import type { Jam } from '@/types/jam';

interface Props {
  jam: Jam;
}

export function JamPlayer({ jam }: Props) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [fullscreen, setFullscreen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = parseChordPro(jam.chordPro);
  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/jam/${jam.id}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            onClick={() => setShowShare(true)}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
          >
            Share
          </button>
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
        <div className="grid lg:grid-cols-[minmax(0,260px)_1fr] gap-6">
          {/* Video — secondary backing-track widget */}
          <div>
            <YouTubePlayer ref={playerRef} videoId={jam.videoId} />
          </div>

          {/* Playback — primary focus */}
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

      {/* Share modal */}
      {showShare && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold">Share this Jam</h3>
            <input
              readOnly
              value={shareUrl}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono select-all"
              onFocus={(e) => e.target.select()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy link'}
              </button>
              <button
                onClick={() => setShowShare(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
