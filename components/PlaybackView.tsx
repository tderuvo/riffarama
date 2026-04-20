'use client';

import { useEffect, useRef, useState } from 'react';
import { ParsedLine, getActiveLine } from '@/lib/chordpro';
import { ChordDisplay } from './ChordDisplay';
import type { SyncedLine } from '@/types/jam';
import type { YouTubePlayerHandle } from './YouTubePlayer';

interface Props {
  lines: ParsedLine[];
  timings: SyncedLine[];
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
  fontSize?: 'normal' | 'large';
}

export function PlaybackView({ lines, timings, playerRef, fontSize = 'normal' }: Props) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = playerRef.current?.getCurrentTime() ?? 0;
      setCurrentTime(t);
      const idx = getActiveLine(timings, t);
      setActiveIndex(idx);
    }, 100);
    return () => clearInterval(interval);
  }, [timings, playerRef]);

  // Auto-scroll active line into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  const sortedTimings = [...timings].sort((a, b) => a.index - b.index);
  const nextTiming = sortedTimings.find((t) => t.index > activeIndex);
  const nextIndex = nextTiming?.index ?? -1;

  return (
    <div className="space-y-1 font-mono overflow-y-auto max-h-[60vh] pr-2 scroll-smooth">
      {lines.map((line, i) => {
        if (line.type === 'blank') return <div key={i} className="h-2" />;
        if (line.type === 'section') {
          return (
            <div key={i} className="pt-3 pb-1">
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-zinc-600 border border-zinc-800 rounded px-2 py-0.5">
                {line.text}
              </span>
            </div>
          );
        }

        const isActive = i === activeIndex;
        const isNext = i === nextIndex;

        return (
          <div
            key={i}
            ref={isActive ? activeRef : undefined}
            className={[
              'rounded-lg px-3 py-1.5 transition-all duration-150',
              isActive
                ? 'bg-amber-500/20 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.01]'
                : isNext
                  ? 'opacity-60 border border-transparent'
                  : 'opacity-30 border border-transparent',
            ].join(' ')}
          >
            <ChordLineInline
              pairs={line.pairs}
              fontSize={fontSize}
              isActive={isActive}
            />
          </div>
        );
      })}
      <div className="h-32" />
    </div>
  );
}

function ChordLineInline({
  pairs,
  fontSize,
  isActive,
}: {
  pairs: { chord: string; lyric: string }[];
  fontSize: 'normal' | 'large';
  isActive: boolean;
}) {
  const textSize = fontSize === 'large' ? 'text-2xl' : 'text-lg';
  const chordSize = fontSize === 'large' ? 'text-lg' : 'text-sm';
  const hasChords = pairs.some((p) => p.chord);

  if (!hasChords) {
    return (
      <div
        className={`${textSize} font-medium leading-relaxed ${isActive ? 'text-white' : 'text-zinc-300'}`}
      >
        {pairs.map((p) => p.lyric).join('')}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap">
      {pairs.map((pair, i) => (
        <span key={i} className="inline-block">
          <span
            className={`block ${chordSize} font-bold leading-none min-w-[0.5rem] ${
              isActive ? 'text-amber-400' : 'text-amber-600'
            }`}
          >
            {pair.chord || '\u00A0'}
          </span>
          <span
            className={`block ${textSize} font-medium leading-relaxed whitespace-pre ${
              isActive ? 'text-white' : 'text-zinc-300'
            }`}
          >
            {pair.lyric || '\u00A0'}
          </span>
        </span>
      ))}
    </div>
  );
}
