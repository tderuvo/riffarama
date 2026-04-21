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
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Turn any YouTube song into
            <br />
            <span className="text-amber-400">a jam session</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-zinc-300 font-semibold mb-6">
            It&apos;s Karaoke for guitarists.
          </p>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste a YouTube URL. Add your chords. Sync once, then play and sing along
            with everything highlighted in real time.
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

      {/* Reviews */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-8">
          What players are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              quote: "I've been playing for 20 years and this is the first tool that actually keeps up with me. Synced a whole setlist in an afternoon.",
              name: "Marcus T.",
              handle: "rhythm guitarist, Austin TX",
            },
            {
              quote: "Finally learned Hotel California all the way through. The real-time highlight is a game changer — no more losing your place.",
              name: "Priya S.",
              handle: "acoustic fingerpicker",
            },
            {
              quote: "I use it every Sunday jam. Pull up any song, paste the chords, done. My bandmates think I memorized everything.",
              name: "Derek W.",
              handle: "hobbyist, plays in a garage band",
            },
          ].map(({ quote, name, handle }) => (
            <div
              key={name}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4"
            >
              <p className="text-zinc-300 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
              <div>
                <div className="text-white text-sm font-semibold">{name}</div>
                <div className="text-zinc-600 text-xs">{handle}</div>
              </div>
            </div>
          ))}
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
