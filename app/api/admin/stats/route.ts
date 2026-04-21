import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  // Week starts Monday 00:00:00 UTC.
  // UTC day: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  // Days since last Monday: Sun→6, Mon→0, Tue→1, Wed→2, Thu→3, Fri→4, Sat→5
  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysSinceMonday = utcDay === 0 ? 6 : utcDay - 1;

  const weekStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday,
    0, 0, 0, 0,
  ));

  const [totalRes, weekRes] = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM "Jam"'),
    pool.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM "Jam" WHERE "createdAt" >= $1',
      [weekStart],
    ),
  ]);

  return NextResponse.json({
    total: parseInt(totalRes.rows[0].count, 10),
    thisWeek: parseInt(weekRes.rows[0].count, 10),
  });
}
