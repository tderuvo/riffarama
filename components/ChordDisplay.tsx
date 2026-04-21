'use client';

import { ParsedLine, ChordPair, formatSectionLabel } from '@/lib/chordpro';

interface Props {
  lines: ParsedLine[];
  activeIndex?: number;
  syncingIndex?: number;
  playingIndex?: number;
  fontSize?: 'normal' | 'large';
  highlightMode?: 'none' | 'active' | 'syncing';
}

export function ChordDisplay({
  lines,
  activeIndex = -1,
  syncingIndex = -1,
  playingIndex = -1,
  fontSize = 'normal',
  highlightMode = 'none',
}: Props) {
  const textSize = fontSize === 'large' ? 'text-xl' : 'text-base';
  const chordSize = fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className="space-y-1 font-mono">
      {lines.map((line, i) => {
        if (line.type === 'blank') {
          return <div key={i} className="h-3" />;
        }

        if (line.type === 'section') {
          return (
            <div key={i} className="pt-3 pb-1">
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-zinc-500 border border-zinc-700 rounded px-2 py-0.5">
                {formatSectionLabel(line.text)}
              </span>
            </div>
          );
        }

        const isActive = highlightMode === 'active' && i === activeIndex;
        const isPlaying = highlightMode === 'syncing' && i === playingIndex;
        const isSyncing = highlightMode === 'syncing' && i === syncingIndex;

        return (
          <div
            key={i}
            className={[
              'rounded-lg px-3 py-1.5 transition-all duration-150',
              isActive
                ? 'bg-amber-500/20 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : isPlaying
                  ? 'bg-amber-500/10 border border-amber-500/25'
                  : isSyncing
                    ? 'bg-zinc-800 border border-zinc-600'
                    : 'border border-transparent',
            ].join(' ')}
          >
            <ChordLine pairs={line.pairs} textSize={textSize} chordSize={chordSize} />
          </div>
        );
      })}
    </div>
  );
}

function ChordLine({
  pairs,
  textSize,
  chordSize,
}: {
  pairs: ChordPair[];
  textSize: string;
  chordSize: string;
}) {
  const hasChords = pairs.some((p) => p.chord);

  if (!hasChords) {
    return (
      <div className={`${textSize} text-zinc-200 leading-relaxed`}>
        {pairs.map((p) => p.lyric).join('')}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap">
      {pairs.map((pair, i) => (
        <span key={i} className="inline-block">
          <span
            className={`block ${chordSize} font-bold text-amber-400 leading-none min-w-[0.5rem]`}
          >
            {pair.chord || '\u00A0'}
          </span>
          <span className={`block ${textSize} text-zinc-200 leading-relaxed whitespace-pre`}>
            {pair.lyric || '\u00A0'}
          </span>
        </span>
      ))}
    </div>
  );
}
