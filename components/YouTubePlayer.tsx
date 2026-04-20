'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// Minimal inline types for the YouTube IFrame API
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getPlayerState(): number;
  destroy(): void;
}

interface YTPlayerOptions {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: () => void;
    onStateChange?: (e: { data: number }) => void;
  };
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: (() => void) | undefined;
    YT: {
      Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
    } | undefined;
  }
}

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  getPlayerState: () => number;
}

interface Props {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(
  ({ videoId, onReady, onStateChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const [apiReady, setApiReady] = useState(false);

    useEffect(() => {
      if (typeof window === 'undefined') return;

      if (window.YT?.Player) {
        setApiReady(true);
        return;
      }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        setApiReady(true);
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }, []);

    useEffect(() => {
      if (!apiReady || !containerRef.current || !videoId) return;

      // Destroy previous player and clear ref so methods aren't called on a dead player
      playerRef.current?.destroy();
      playerRef.current = null;

      const div = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(div);

      if (!window.YT) return;

      // Capture the raw YT instance; only expose it via ref AFTER onReady fires —
      // YT.Player methods (getCurrentTime etc.) aren't safe to call before then.
      let instance: YTPlayer | null = null;
      instance = new window.YT.Player(div, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            playerRef.current = instance;
            onReady?.();
          },
          onStateChange: (e: { data: number }) => onStateChange?.(e.data),
        },
      });
    }, [apiReady, videoId]); // eslint-disable-line react-hooks/exhaustive-deps

    function safeCall<T>(fn: () => T, fallback: T): T {
      const p = playerRef.current;
      if (!p) return fallback;
      try { return fn(); } catch { return fallback; }
    }

    useImperativeHandle(ref, () => ({
      play: () => safeCall(() => playerRef.current!.playVideo(), undefined),
      pause: () => safeCall(() => playerRef.current!.pauseVideo(), undefined),
      togglePlayPause: () => {
        const state = safeCall(() => playerRef.current!.getPlayerState(), -1);
        if (state === 1) safeCall(() => playerRef.current!.pauseVideo(), undefined);
        else safeCall(() => playerRef.current!.playVideo(), undefined);
      },
      getCurrentTime: () => safeCall(() => playerRef.current!.getCurrentTime(), 0),
      seekTo: (s) => safeCall(() => playerRef.current!.seekTo(s, true), undefined),
      getPlayerState: () => safeCall(() => playerRef.current!.getPlayerState(), -1),
    }));

    return (
      <div className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
