import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const jam = await prisma.jam.create({
      data: {
        id: generateId(),
        title: title || 'Untitled Jam',
        videoId,
        youtubeUrl: youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
        chordPro,
        timings: JSON.stringify(timings || []),
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
    return Response.json({ error: 'Failed to save jam' }, { status: 500 });
  }
}
