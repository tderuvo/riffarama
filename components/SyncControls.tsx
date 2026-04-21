'use client';

interface Props {
  syncingLineNum: number;
  totalLines: number;
  currentTime: number;
  syncStarted: boolean;
  onStartSync: () => void;
  onSync: () => void;
  onSkip: () => void;
  onUndo: () => void;
  onReset: () => void;
  onJumpBack: () => void;
  onTogglePlay: () => void;
  onFinish: () => void;
  isPlaying: boolean;
}

export function SyncControls({
  syncingLineNum,
  totalLines,
  currentTime,
  syncStarted,
  onStartSync,
  onSync,
  onSkip,
  onUndo,
  onReset,
  onJumpBack,
  onTogglePlay,
  onFinish,
  isPlaying,
}: Props) {
  const isDone = syncingLineNum >= totalLines;
  const progress = totalLines > 0 ? Math.round((syncingLineNum / totalLines) * 100) : 0;

  if (!syncStarted) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="space-y-1">
          <h3 className="text-white font-semibold">Ready to sync</h3>
          <p className="text-sm text-zinc-400">
            Click <strong className="text-white">Start Syncing</strong> — the song will begin playing.
            Then tap <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">Space</kbd> the
            moment you <em>hear</em> each line start.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
          <span><kbd className="bg-zinc-800 px-1 rounded">Space</kbd> Mark each line</span>
          <span><kbd className="bg-zinc-800 px-1 rounded">P</kbd> Pause / resume</span>
          <span><kbd className="bg-zinc-800 px-1 rounded">←</kbd> Jump back 5s</span>
          <span><kbd className="bg-zinc-800 px-1 rounded">Z</kbd> Undo last mark</span>
        </div>

        <button
          onClick={onStartSync}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-lg transition-colors"
        >
          ▶ Start Syncing
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          {isDone ? (
            <span className="text-emerald-400 font-semibold">✓ All lines synced!</span>
          ) : (
            <>
              Line{' '}
              <span className="text-white font-semibold">{syncingLineNum + 1}</span>
              {' '}of{' '}
              <span className="text-white font-semibold">{totalLines}</span>
            </>
          )}
        </span>
        <span className="text-zinc-500 font-mono">{formatTime(currentTime)}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sync tap button */}
      {!isDone && (
        <div className="flex gap-2">
          <button
            onClick={onSync}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-lg transition-colors active:scale-95"
          >
            Tap when line {syncingLineNum + 1} starts{' '}
            <kbd className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-sm font-mono">SPACE</kbd>
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
            title="Skip this line (S key)"
          >
            Skip
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onTogglePlay}
          className="flex-1 min-w-[80px] py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={onJumpBack}
          className="flex-1 min-w-[80px] py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          title="← Arrow key"
        >
          ↩ −5s
        </button>
        <button
          onClick={onUndo}
          disabled={syncingLineNum === 0}
          className="flex-1 min-w-[80px] py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors disabled:opacity-40"
          title="Z key"
        >
          ↩ Undo
        </button>
        <button
          onClick={onReset}
          className="flex-1 min-w-[80px] py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          title="R key"
        >
          ↺ Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600">
        <span><kbd className="bg-zinc-800 px-1 rounded">Space</kbd> Mark line</span>
        <span><kbd className="bg-zinc-800 px-1 rounded">S</kbd> Skip line</span>
        <span><kbd className="bg-zinc-800 px-1 rounded">P</kbd> Pause / play</span>
        <span><kbd className="bg-zinc-800 px-1 rounded">←</kbd> Jump back 5s</span>
        <span><kbd className="bg-zinc-800 px-1 rounded">Z</kbd> Undo last mark</span>
      </div>

      {isDone && (
        <button
          onClick={onFinish}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
        >
          ▶ Play Jam
        </button>
      )}
    </div>
  );
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
