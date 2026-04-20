import Link from 'next/link';
import { RecentJams } from '@/components/RecentJams';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="text-4xl">🎸</span>
            <span className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Riffarama
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            Turn any YouTube song into
            <br />
            <span className="text-amber-400">a jam session</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste a YouTube URL. Paste ChordPro chords. Tap to sync each line once.
            Then play it back karaoke-style — chords and lyrics highlighted in real time.
          </p>

          {/* Feature steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
            {[
              { icon: '📺', step: '1', label: 'Paste YouTube URL' },
              { icon: '🎼', step: '2', label: 'Paste ChordPro' },
              { icon: '🥁', step: '3', label: 'Tap to sync lines' },
              { icon: '🎵', step: '4', label: 'Play anytime' },
            ].map(({ icon, step, label }) => (
              <div
                key={step}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-xs text-amber-500 font-mono font-bold mb-1">
                  STEP {step}
                </div>
                <div className="text-sm text-zinc-300 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-lg transition-all hover:scale-105 active:scale-95"
            >
              🎸 Start a Jam
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-lg border border-zinc-700 transition-all"
            >
              ▶ View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Jams */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <RecentJams />
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-700 text-sm">
        Riffarama · Paste. Sync. Play. · Unlisted jams only.
      </footer>
    </div>
  );
}
