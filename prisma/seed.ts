import { PrismaClient, Track } from "@prisma/client";
import tracks from "./data.json";

const db = new PrismaClient();

async function seed() {
  const tracks = await Promise.all(
    getTracks().map((track) => {
      return db.track.create({ data: track });
    })
  );
  await Promise.all(
    getPlaylist(tracks).map((playlist) => {
      return db.playlist.create({ data: playlist });
    })
  );
}

seed();

function getTracks() {
  return tracks.items.map((track) => {
    return {
      name: track.track.name,
      artist: track.track.artists.map((artist) => artist.name).join(","),
      cover: track.track.album.images[0].url,
    };
  });
}

function getPlaylist(tracks: Track[]) {
  return [
    {
      name: "My top song",
      cover: "",
      tracks: {
        connect: tracks.slice(0, 5).map(({ id }) => ({ id })),
      },
    },
    {
      name: "Devoxx Playlist",
      cover: "",
      tracks: {
        connect: tracks.slice(-5).map(({ id }) => ({ id })),
      },
    },
  ];
}
