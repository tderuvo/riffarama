export type SyncedLine = {
  index: number;
  time: number;
};

export type Jam = {
  id: string;
  title: string;
  videoId: string;
  youtubeUrl: string;
  chordPro: string;
  timings: SyncedLine[];
  createdAt: string;
  updatedAt: string;
};
