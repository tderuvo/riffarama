'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { YouTubePlayer, YouTubePlayerHandle } from '@/components/YouTubePlayer';
import { ChordDisplay } from '@/components/ChordDisplay';
import { SyncControls } from '@/components/SyncControls';
import { PlaybackView } from '@/components/PlaybackView';
import { ShareLinkBox } from '@/components/ShareLinkBox';
import { parseChordPro, getSyncableLines, ParsedLine } from '@/lib/chordpro';
import { extractVideoId } from '@/lib/youtube';
import { saveJamLocally, getRecentJams } from '@/lib/storage';
import type { Jam, SyncedLine } from '@/types/jam';

type Mode = 'input' | 'sync' | 'playback';

function CreatePageInner() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>('input');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [chordPro, setChordPro] = useState('');
  const [jamTitle, setJamTitle] = useState('');
  const [error, setError] = useState('');
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  const [timings, setTimings] = useState<SyncedLine[]>([]);
  const [syncingIdx, setSyncingIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [savedLocally, setSavedLocally] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [syncStarted, setSyncStarted] = useState(false);

  const playerRef = useRef<YouTubePlayerHandle>(null);
  const syncableLinesRef = useRef<{ index: number; line: ParsedLine }[]>([]);
  const timePollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from local storage if ?load=id
  useEffect(() => {
    const loadId = searchParams.get('load');
    if (!loadId) return;
    const jams = getRecentJams();
    const jam = jams.find((j) => j.id === loadId);
    if (!jam) return;
    prefillJam(jam);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function prefillJam(jam: Jam) {
    setYoutubeUrl(jam.youtubeUrl);
    setVideoId(jam.videoId);
    setChordPro(jam.chordPro);
    setJamTitle(jam.title);
    const lines = parseChordPro(jam.chordPro);
    syncableLinesRef.current = getSyncableLines(lines);
    setParsedLines(lines);
    setTimings(jam.timings);
    setSyncingIdx(jam.timings.length);
    setMode(jam.timings.length > 0 ? 'playback' : 'sync');
  }

  const handleLoad = () => {
    const id = extractVideoId(youtubeUrl);
    if (!id) { setError('Could not find a valid YouTube video ID in that URL.'); return; }
    if (!chordPro.trim()) { setError('Please paste some ChordPro text.'); return; }
    const lines = parseChordPro(chordPro);
    const syncable = getSyncableLines(lines);
    if (syncable.length === 0) { setError('No lyric lines found in ChordPro text.'); return; }
    syncableLinesRef.current = syncable;
    setParsedLines(lines);
    setVideoId(id);
    setTimings([]);
    setSyncingIdx(0);
    setSyncStarted(false);
    setError('');
    setShareUrl('');
    setSavedLocally(false);
    setMode('sync');
  };

  // Poll current time during sync/playback
  useEffect(() => {
    if (mode === 'input') return;
    timePollerRef.current = setInterval(() => {
      setCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
    }, 200);
    return () => {
      if (timePollerRef.current) clearInterval(timePollerRef.current);
    };
  }, [mode]);

  const handleSync = useCallback(() => {
    const sl = syncableLinesRef.current;
    if (syncingIdx >= sl.length) return;
    const time = playerRef.current?.getCurrentTime() ?? 0;
    const lineIndex = sl[syncingIdx].index;
    setTimings((prev) => [
      ...prev.filter((t) => t.index !== lineIndex),
      { index: lineIndex, time },
    ]);
    setSyncingIdx((prev) => prev + 1);
  }, [syncingIdx]);

  const handleUndo = useCallback(() => {
    if (syncingIdx === 0) return;
    const newIdx = syncingIdx - 1;
    const lineIndex = syncableLinesRef.current[newIdx].index;
    setTimings((prev) => prev.filter((t) => t.index !== lineIndex));
    setSyncingIdx(newIdx);
  }, [syncingIdx]);

  const handleReset = useCallback(() => {
    setTimings([]);
    setSyncingIdx(0);
    setSyncStarted(false);
    playerRef.current?.pause();
  }, []);

  const handleStartSync = useCallback(() => {
    setSyncStarted(true);
    playerRef.current?.play();
  }, []);

  const handleJumpBack = useCallback(() => {
    const t = playerRef.current?.getCurrentTime() ?? 0;
    playerRef.current?.seekTo(Math.max(0, t - 5));
  }, []);

  const handleTogglePlay = useCallback(() => {
    playerRef.current?.togglePlayPause();
  }, []);

  // Keyboard shortcuts during sync mode
  useEffect(() => {
    if (mode !== 'sync') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); if (syncStarted) handleSync(); }
      else if (e.code === 'KeyZ' && !e.metaKey && !e.ctrlKey) handleUndo();
      else if (e.code === 'KeyR') handleReset();
      else if (e.code === 'ArrowLeft') handleJumpBack();
      else if (e.code === 'KeyP') handleTogglePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, syncStarted, handleSync, handleUndo, handleReset, handleJumpBack, handleTogglePlay]);

  const handleSaveLocally = () => {
    const jam: Jam = {
      id: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      title: jamTitle || 'Untitled Jam',
      videoId,
      youtubeUrl,
      chordPro,
      timings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveJamLocally(jam);
    setSavedLocally(true);
  };

  const handleShare = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/jams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jamTitle || 'Untitled Jam',
          videoId,
          youtubeUrl,
          chordPro,
          timings,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      const url = `${window.location.origin}/jam/${data.id}`;
      setShareUrl(url);
      saveJamLocally({ ...data });
      setSavedLocally(true);
    } catch {
      setSaveError('Failed to save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const syncCurrentLine = syncableLinesRef.current[syncingIdx];

  if (mode === 'input') {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm mb-8 inline-block">
            ← Back
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="text-amber-400">🎸</span> New Jam
            </h1>
            <p className="text-zinc-400">Paste a YouTube URL and ChordPro to get started.</p>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Jam Title <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="text"
                value={jamTitle}
                onChange={(e) => setJamTitle(e.target.value)}
                placeholder="e.g. Wonderwall — Oasis"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                YouTube URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
              />
            </div>

            {/* ChordPro */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                ChordPro
              </label>
              <textarea
                value={chordPro}
                onChange={(e) => setChordPro(e.target.value)}
                placeholder={`{title: My Song}\n\n{soc}\n[G]Hello [C]world\n[G]How are [D]you\n{eoc}`}
                rows={12}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm resize-none"
              />
              <p className="mt-1.5 text-xs text-zinc-600">
                Supports inline chords like <code className="text-amber-600">[G]Hello [C]world</code> and
                sections like <code className="text-amber-600">{'{soc}'}</code>, <code className="text-amber-600">{'{eoc}'}</code>
              </p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleLoad}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-lg transition-all active:scale-95"
            >
              Load Jam →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← Riffarama
          </Link>
          <h1 className="text-white font-semibold truncate max-w-xs">
            {jamTitle || 'Untitled Jam'}
          </h1>
          {mode === 'sync' && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
              Sync Mode
            </span>
          )}
          {mode === 'playback' && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
              Playback
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((f) => (f === 'normal' ? 'large' : 'normal'))}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
            title="Toggle font size"
          >
            {fontSize === 'normal' ? 'Aa' : 'AA'}
          </button>
          {mode === 'playback' && (
            <button
              onClick={() => { setMode('sync'); setSyncStarted(false); playerRef.current?.pause(); }}
              className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
            >
              Re-sync
            </button>
          )}
          {mode === 'sync' && timings.length > 0 && (
            <button
              onClick={() => setMode('playback')}
              className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
            >
              Preview
            </button>
          )}
          <button
            onClick={() => { setMode('input'); setVideoId(''); }}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
          >
            Edit
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Video + controls */}
          <div className="space-y-4">
            <YouTubePlayer
              ref={playerRef}
              videoId={videoId}
              onStateChange={(state) => setIsPlaying(state === 1)}
            />

            {mode === 'sync' && (
              <SyncControls
                syncingLineNum={syncingIdx}
                totalLines={syncableLinesRef.current.length}
                currentTime={currentTime}
                syncStarted={syncStarted}
                onStartSync={handleStartSync}
                onSync={handleSync}
                onUndo={handleUndo}
                onReset={handleReset}
                onJumpBack={handleJumpBack}
                onTogglePlay={handleTogglePlay}
                onFinish={() => setMode('playback')}
                isPlaying={isPlaying}
              />
            )}

            {mode === 'playback' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                {/* Transpose */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">Transpose:</span>
                  <button
                    onClick={() => setTranspose((t) => t - 1)}
                    className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                  >−</button>
                  <span className="text-white font-mono w-8 text-center">
                    {transpose > 0 ? `+${transpose}` : transpose}
                  </span>
                  <button
                    onClick={() => setTranspose((t) => t + 1)}
                    className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                  >+</button>
                  {transpose !== 0 && (
                    <button
                      onClick={() => setTranspose(0)}
                      className="text-xs text-zinc-600 hover:text-zinc-400"
                    >reset</button>
                  )}
                </div>

                {/* Save & Share */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLocally}
                    disabled={savedLocally}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {savedLocally ? '✓ Saved locally' : '💾 Save locally'}
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={isSaving || !!shareUrl}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {isSaving ? 'Saving…' : shareUrl ? '✓ Link ready' : '🔗 Save & Get Link'}
                  </button>
                </div>

                {saveError && (
                  <p className="text-xs text-red-400">{saveError}</p>
                )}
                {shareUrl && <ShareLinkBox url={shareUrl} />}
              </div>
            )}
          </div>

          {/* Right: Lyrics/chords */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 min-h-[400px]">
            {mode === 'sync' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                    Chord Sheet
                  </h2>
                  {syncCurrentLine && (
                    <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                      Syncing line {syncingIdx + 1}
                    </span>
                  )}
                </div>
                <ChordDisplay
                  lines={parsedLines}
                  syncingIndex={syncCurrentLine?.index}
                  highlightMode="syncing"
                  fontSize={fontSize}
                />
              </>
            )}

            {mode === 'playback' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                    Live Playback
                  </h2>
                  <span className="text-xs text-zinc-600 font-mono">
                    {formatTime(currentTime)}
                  </span>
                </div>
                <PlaybackView
                  lines={transposeParsedLines(parsedLines, transpose)}
                  timings={timings}
                  playerRef={playerRef}
                  fontSize={fontSize}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading…</div>
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  );
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord;
  const match = chord.match(/^([A-G][b#]?)(.*)/);
  if (!match) return chord;
  const [, root, suffix] = match;
  const idx = NOTES.indexOf(root) !== -1 ? NOTES.indexOf(root) : FLAT_NOTES.indexOf(root);
  if (idx === -1) return chord;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return NOTES[newIdx] + suffix;
}

function transposeParsedLines(lines: ParsedLine[], semitones: number): ParsedLine[] {
  if (semitones === 0) return lines;
  return lines.map((line) => {
    if (line.type !== 'lyric') return line;
    return {
      ...line,
      pairs: line.pairs.map((pair) => ({
        ...pair,
        chord: transposeChord(pair.chord, semitones),
      })),
    };
  });
}
