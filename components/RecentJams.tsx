'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentJams, removeLocalJam } from '@/lib/storage';
import type { Jam } from '@/types/jam';

export function RecentJams() {
  const [jams, setJams] = useState<Jam[]>([]);

  useEffect(() => {
    setJams(getRecentJams());
  }, []);

  if (jams.length === 0) return null;

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeLocalJam(id);
    setJams(getRecentJams());
  };

  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold text-zinc-400 mb-4 uppercase tracking-widest text-sm">
        Recent Jams
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jams.map((jam) => (
          <Link
            key={jam.id}
            href={`/create?load=${jam.id}`}
            className="group relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">
                  {jam.title || 'Untitled Jam'}
                </div>
                <div className="text-xs text-zinc-500 mt-1 truncate">
                  youtube.com/watch?v={jam.videoId}
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  {jam.timings.length} lines synced ·{' '}
                  {new Date(jam.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => handleRemove(jam.id, e)}
                className="text-zinc-700 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 -m-1"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
