import { Playlist, Track } from "@prisma/client";
import { db } from "~/utils/db.server";

export type TrackRepository = {
  findAvailableTracksNotIn(tracks: Track[]): Promise<Track[]>;
};

export const tracks: TrackRepository = {
  findAvailableTracksNotIn: async (tracks) => {
    const playlistTrackIds = tracks.map(({ id }) => id);
    return db.track.findMany({
      where: { NOT: { id: { in: playlistTrackIds } } },
    });
  },
};
