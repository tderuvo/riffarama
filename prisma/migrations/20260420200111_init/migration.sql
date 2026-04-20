-- CreateTable
CREATE TABLE "Jam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "chordPro" TEXT NOT NULL,
    "timings" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
