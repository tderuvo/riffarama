import type { Jam } from '@/types/jam';

const KEY = 'riffarama_jams';
const MAX = 20;

export function getRecentJams(): Jam[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJamLocally(jam: Jam): void {
  if (typeof window === 'undefined') return;
  try {
    const jams = getRecentJams().filter((j) => j.id !== jam.id);
    jams.unshift({ ...jam, updatedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(jams.slice(0, MAX)));
  } catch {}
}

export function removeLocalJam(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const jams = getRecentJams().filter((j) => j.id !== id);
    localStorage.setItem(KEY, JSON.stringify(jams));
  } catch {}
}
