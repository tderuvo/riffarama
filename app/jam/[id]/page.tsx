import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import type { JamRow } from '@/lib/db';
import { JamPlayer } from './JamPlayer';
import type { Jam } from '@/types/jam';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function JamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rows } = await pool.query<JamRow>(`SELECT * FROM "Jam" WHERE id = $1`, [id]);
  const row = rows[0];
  if (!row) notFound();

  const jam: Jam = {
    id: row.id,
    title: row.title,
    videoId: row.videoId,
    youtubeUrl: row.youtubeUrl,
    chordPro: row.chordPro,
    timings: JSON.parse(row.timings),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return <JamPlayer jam={jam} />;
}
