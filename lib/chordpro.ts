export type ChordPair = { chord: string; lyric: string };

export type ParsedLine =
  | { type: 'lyric'; raw: string; pairs: ChordPair[] }
  | { type: 'section'; raw: string; text: string }
  | { type: 'blank'; raw: string };

// Lines with no chord brackets that look like section labels
const SECTION_LABEL_RE = /^(intro|outro|verse|pre[-\s]?chorus|chorus|bridge|hook|refrain|coda|tag|solo|interlude|instrumental|spoken|ad[-\s]?lib|break|fill|riff|ending|repeat)(\s.*)?$/i;

export function parseChordPro(text: string): ParsedLine[] {
  return text.split('\n').map((line): ParsedLine => {
    const trimmed = line.trim();

    if (!trimmed) return { type: 'blank', raw: line };

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return { type: 'section', raw: line, text: trimmed.slice(1, -1) };
    }

    // Plain-text label with no chord brackets → treat as section
    if (!trimmed.includes('[') && SECTION_LABEL_RE.test(trimmed)) {
      return { type: 'section', raw: line, text: trimmed };
    }

    return { type: 'lyric', raw: line, pairs: parseChordLine(trimmed) };
  });
}

function parseChordLine(line: string): ChordPair[] {
  const pairs: ChordPair[] = [];

  // Text before first chord
  const firstBracket = line.indexOf('[');
  if (firstBracket > 0) {
    pairs.push({ chord: '', lyric: line.slice(0, firstBracket) });
  }

  const regex = /\[([^\]]*)\]([^\[]*)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    pairs.push({ chord: match[1], lyric: match[2] });
  }

  if (pairs.length === 0) {
    pairs.push({ chord: '', lyric: line });
  }

  return pairs;
}

export function getSyncableLines(
  lines: ParsedLine[]
): { index: number; line: ParsedLine }[] {
  return lines
    .map((line, index) => ({ index, line }))
    .filter(({ line }) => line.type === 'lyric');
}

export function getActiveLine(
  timings: { index: number; time: number }[],
  currentTime: number
): number {
  const sorted = [...timings].sort((a, b) => a.time - b.time);
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].time <= currentTime) return sorted[i].index;
  }
  return -1;
}

export function formatSectionLabel(text: string): string {
  const aliases: Record<string, string> = {
    soc: 'Chorus',
    eoc: 'End Chorus',
    sov: 'Verse',
    eov: 'End Verse',
    sob: 'Bridge',
    eob: 'End Bridge',
  };
  const lower = text.toLowerCase().split(':')[0].trim();
  if (aliases[lower]) return aliases[lower];
  // title: My Song -> My Song
  if (text.includes(':')) return text.split(':').slice(1).join(':').trim();
  return text;
}
