import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jam = await prisma.jam.findUnique({ where: { id } });

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

    const jam = await prisma.jam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(chordPro !== undefined && { chordPro }),
        ...(timings !== undefined && { timings: JSON.stringify(timings) }),
      },
    });

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
