import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import type { JamRow } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rows } = await pool.query<JamRow>(`SELECT * FROM "Jam" WHERE id = $1`, [id]);
    const jam = rows[0];

    if (!jam) {
      return Response.json({ error: 'Jam not found' }, { status: 404 });
    }

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
    return Response.json({ error: 'Failed to fetch jam' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, chordPro, timings } = body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
    if (chordPro !== undefined) { updates.push(`"chordPro" = $${i++}`); values.push(chordPro); }
    if (timings !== undefined) { updates.push(`timings = $${i++}`); values.push(JSON.stringify(timings)); }
    updates.push(`"updatedAt" = $${i++}`);
    values.push(new Date());
    values.push(id);

    const { rows } = await pool.query<JamRow>(
      `UPDATE "Jam" SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    const jam = rows[0];

    if (!jam) return Response.json({ error: 'Jam not found' }, { status: 404 });

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
    return Response.json({ error: 'Failed to update jam' }, { status: 500 });
  }
}
