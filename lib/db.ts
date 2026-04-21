import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pgPool: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export type JamRow = {
  id: string;
  title: string;
  videoId: string;
  youtubeUrl: string;
  chordPro: string;
  timings: string;
  createdAt: Date;
  updatedAt: Date;
};
