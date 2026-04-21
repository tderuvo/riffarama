import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import type { JamRow } from '@/lib/db';

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, videoId, youtubeUrl, chordPro, timings } = body;

    if (!videoId || !chordPro) {
      return Response.json({ error: 'videoId and chordPro are required' }, { status: 400 });
    }

    const id = generateId();
    const now = new Date();
    const { rows } = await pool.query<JamRow>(
      `INSERT INTO "Jam" (id, title, "videoId", "youtubeUrl", "chordPro", timings, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        title || 'Untitled Jam',
        videoId,
        youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
        chordPro,
        JSON.stringify(timings || []),
        now,
        now,
      ]
    );
    const jam = rows[0];

    return Response.json({
      id: jam.id,
      title: jam.title,
      videoId: jam.videoId,
      youtubeUrl: jam.youtubeUrl,
      chordPro: jam.chordPro,
      timings: JSON.parse(jam.timings),
      createdAt: jam.createdAt.toISOString(),
      updatedAt: jam.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to save jam' }, { status: 500 });
  }
}
