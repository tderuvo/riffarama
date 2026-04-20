import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
  const row = await prisma.jam.findUnique({ where: { id } });
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
