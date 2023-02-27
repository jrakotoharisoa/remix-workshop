import { Track } from "@prisma/client";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { playlists } from "~/repositories/playlist-repository.server";
import { tracks } from "~/repositories/track-repository.server";
import { isNonUndefined } from "~/utils/type";

/// TODO: gestion d'erreur avec playlist non trouvée

export const loader = async ({ request, params: { id = "" } }: LoaderArgs) => {
  const playlist = await playlists.find(id);

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  let availableTracks: Track[] = [];
  const url = new URL(request.url);
  if (isEditionUrl(url.pathname)) {
    availableTracks = await tracks.findAvailableTracksNotIn(playlist.tracks);
  }
  return json(
    { playlist, availableTracks },
    {
      headers: { "Cache-Control": "private, max-age=10" },
    }
  );
};

const FormDataRequestSchema = z.object({
  action: z.enum(["add", "delete"]),
  track_id: z.string(),
});

export const action = async ({ request, params: { id = "" } }: ActionArgs) => {
  const rawFormData = Object.fromEntries(await request.formData());
  const formData = FormDataRequestSchema.parse(rawFormData);

  if (formData.action === "add") {
    await playlists.addTrack(id, formData.track_id);
  } else {
    await playlists.removeTrack(id, formData.track_id);
  }

  return null;
};

export default function Playlist() {
  const { playlist: serverPlaylist, availableTracks: serverAvailableTracks } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const formData = navigation.formData ? FormDataRequestSchema.parse(Object.fromEntries(navigation.formData)) : undefined;
  const playlist = formData
    ? formData.action === "add"
      ? {
          ...serverPlaylist,
          tracks: [serverAvailableTracks.find((track) => track.id === formData.track_id), ...serverPlaylist.tracks].filter(isNonUndefined),
        }
      : { ...serverPlaylist, tracks: serverPlaylist.tracks.filter((track) => track.id !== formData.track_id) }
    : serverPlaylist;
  const availableTracks = formData
    ? formData.action === "add"
      ? serverAvailableTracks.filter((track) => track.id !== formData.track_id)
      : [serverPlaylist.tracks.find((track) => track.id === formData.track_id), ...serverAvailableTracks].filter(isNonUndefined)
    : serverAvailableTracks;
  const isEditionMode = isEditionUrl(location.pathname);

  return (
    <div className="flex h-screen flex-col p-6">
      <h1 className="title-1">{playlist?.name}</h1>
      {isEditionMode ? <Link to="./..">Done</Link> : <Link to="./edit">Edit</Link>}
      <div className=" flex min-h-0 flex-1 space-x-4">
        <ul className="flex-1 overflow-auto">
          {playlist?.tracks.map((track) => (
            <li key={track.id} className="flex justify-between space-x-4">
              <span>
                {track.name} · {track.artist}
              </span>
              {isEditionMode && (
                <Form method="post" className="inline">
                  <input name="track_id" type="hidden" value={track.id} />
                  <button type="submit" name="action" value="delete">
                    Remove
                  </button>
                </Form>
              )}
            </li>
          ))}
        </ul>
        <ul className="flex-1 overflow-auto">
          {availableTracks.map((track) => (
            <li key={track.id} className="flex justify-between space-x-4">
              <span>
                {track.name} · {track.artist}
              </span>
              {isEditionMode && (
                <Form method="post" className="inline">
                  <input name="track_id" type="hidden" value={track.id} />
                  <button type="submit" name="action" value="add">
                    Add
                  </button>
                </Form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const isEditionUrl = (url: string) => url.endsWith("/edit");
