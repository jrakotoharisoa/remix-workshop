import { Playlist, Track } from "@prisma/client";
import { db } from "~/utils/db.server";
import { sleep } from "~/utils/latency.server";
type PlaylistWithTracks = Playlist & {
  tracks: Track[];
};
type Playlists = {
  find: (playlistId: string) => Promise<PlaylistWithTracks | null>;
  addTrack: (playlistId: string, trackId: string) => Promise<void>;
  removeTrack: (playlistId: string, trackId: string) => Promise<void>;
};

export const playlists: Playlists = {
  find: async (playlistId) => {
    return db.playlist.findUnique({
      where: { id: playlistId },
      include: {
        tracks: true,
      },
    });
  },
  addTrack: async (playlistId, trackId) => {
    await sleep(2_000);
    await db.playlist.update({
      where: { id: playlistId },
      data: {
        tracks: {
          connect: [{ id: trackId }],
        },
      },
    });
  },
  removeTrack: async (playlistId, trackId) => {
    await sleep(3_000);
    await db.playlist.update({
      where: { id: playlistId },
      data: {
        tracks: {
          disconnect: [{ id: trackId }],
        },
      },
    });
  },
};
