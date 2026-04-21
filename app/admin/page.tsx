'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = 'riffarama_admin';
const PASSWORD = 'Reddington';

type Stats = { total: number; thisWeek: number };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadError, setLoadError] = useState('');

  // Restore session on mount
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') setAuthed(true);
  }, []);

  // Fetch stats once authed
  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stats');
        return r.json();
      })
      .then((data: Stats) => setStats(data))
      .catch(() => setLoadError('Could not load stats.'));
  }, [authed]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-xs space-y-5">
          <h1 className="text-xl font-bold text-white">Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">Admin</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">
            Total Jams
          </h2>

          {loadError && <p className="text-red-400 text-sm">{loadError}</p>}

          {!stats && !loadError && (
            <p className="text-zinc-500 text-sm">Loading…</p>
          )}

          {stats && (
            <div className="space-y-4">
              <div>
                <div className="text-5xl font-black text-white">{stats.total}</div>
                <div className="text-xs text-zinc-500 mt-1">all time</div>
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <div className="text-3xl font-bold text-amber-400">{stats.thisWeek}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  new this week (since Monday 00:00 GMT)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
