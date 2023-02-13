import { PrismaClient } from "@prisma/client";
import tracks from "./data.json";

const db = new PrismaClient();

async function seed() {
  await Promise.all([
    ...getTracks().map((track) => {
      return db.track.create({ data: track });
    }),
    ...getPlaylist().map((playlist) => {
      return db.playlist.create({ data: playlist });
    }),
  ]);
}

seed();

function getTracks() {
  return tracks.items.map((track) => {
    return {
      name: track.track.name,
      artist: track.track.artists.map((artist) => artist.name).join(","),
    };
  });
}

function getPlaylist() {
  return [
    {
      name: "My top song",
      cover: "",
    },
    {
      name: "Devoxx Playlist",
      cover: "",
    },
  ];
}
