'use client';

import { useState } from 'react';

interface Props {
  url: string;
}

export function ShareLinkBox({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 text-lg">🔗</span>
        <span className="text-sm font-semibold text-white">Permanent Link</span>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono min-w-0"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-700 hover:bg-zinc-600 text-white'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-zinc-600">
        Anyone with this link can open your jam. It&apos;s unlisted — not indexed or discoverable.
      </p>
    </div>
  );
}
