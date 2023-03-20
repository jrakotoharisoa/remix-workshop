import { json, LoaderArgs } from "@remix-run/node";
import { playlists } from "~/repositories/playlist-repository.server";

export const loader = async ({ params: { id = "" } }: LoaderArgs) => {
  const playlist = await playlists.find(id);

  if (!playlist) {
    return json({ error: "playlist not found" }, { status: 404 });
  }

  return json(
    { playlist },
    {
      headers: {
        "Content-Disposition": `attachment; filename="${playlist.name}.json"`,
      },
    }
  );
};
