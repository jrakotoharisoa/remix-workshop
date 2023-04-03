import { Track } from "@prisma/client";
import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Form, isRouteErrorResponse, Link, useLoaderData, useLocation, useNavigation, useRouteError } from "@remix-run/react";
import { z } from "zod";
import { playlists } from "~/repositories/playlist-repository.server";
import { tracks } from "~/repositories/track-repository.server";
import { PlusIcon } from "~/ui/icons/Plus";
import { TrashIcon } from "~/ui/icons/Trash";
import { isNonUndefined } from "~/utils/type";
import { commitSession, getSession } from "~/utils/user-session.server";

export const loader = async ({ request, params: { id = "" } }: LoaderArgs) => {
  const playlist = await playlists.find(id);
  if (!playlist) {
    throw new Response("Playlist not found", {
      status: 404,
      statusText: "Not found",
    });
  }

  let availableTracks: Track[] = [];
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  if (isEditionUrl(url.pathname)) {
    if (!session.has("username")) {
      return redirect(`/login?from=${url.pathname}`);
    }

    availableTracks = await tracks.findAvailableTracksNotIn(playlist.tracks);
  }

  const welcomeMessage: string | undefined = session.get("welcome");
  return json(
    { playlist, welcomeMessage, availableTracks },
    {
      headers: { "Cache-Control": "private, max-age=10", "Set-Cookie": await commitSession(session) },
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

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (!isRouteErrorResponse(error)) {
    throw error;
  }

  return (
    <>
      <p>HTTP status: {error.status}</p>
      <p>{error.data}</p>
    </>
  );
};

export default function Playlist() {
  const { playlist: serverPlaylist, availableTracks: serverAvailableTracks, welcomeMessage } = useLoaderData<typeof loader>();
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
    <div className="flex h-screen flex-col space-y-3 px-6 py-3">
      <div className="flex items-center space-x-3">
        <h1 className="title-1">{playlist?.name}</h1>
        {isEditionMode ? (
          <Link className="rounded-md px-3 py-1 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50" to="./..">
            Done
          </Link>
        ) : (
          <>
            <Link className="rounded-md px-3 py-1 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50" to="./edit">
              Edit
            </Link>
            <Link
              className="rounded-md px-3 py-1 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
              to={`/api/playlists/${playlist.id}.json`}
              reloadDocument
              download
            >
              Download as JSON
            </Link>
          </>
        )}
      </div>

      {welcomeMessage && <div className="w-full rounded-md bg-lime-200 p-4">{welcomeMessage}</div>}

      <div className="flex min-h-0 flex-1 space-x-4">
        <ul className="flex-1 space-y-2 overflow-auto p-2 pl-0">
          {playlist?.tracks.map((track) => (
            <li key={track.id} className="flex min-h-[2rem] items-center justify-between space-x-4">
              <span>
                {track.name} · {track.artist}
              </span>
              {isEditionMode && (
                <Form method="post" className="inline">
                  <input name="track_id" type="hidden" value={track.id} />
                  <button
                    type="submit"
                    name="action"
                    value="delete"
                    className="rounded-md p-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                  >
                    <TrashIcon aria-label="Remove" className="h-4" />
                  </button>
                </Form>
              )}
            </li>
          ))}
        </ul>
        <ul className="flex-1 space-y-2 overflow-auto p-2 pl-0">
          {availableTracks.map((track) => (
            <li key={track.id} className="flex min-h-[2rem] items-center justify-between space-x-4">
              <span>
                {track.name} · {track.artist}
              </span>
              {isEditionMode && (
                <Form method="post" className="inline">
                  <input name="track_id" type="hidden" value={track.id} />
                  <button
                    type="submit"
                    name="action"
                    value="add"
                    className="rounded-md p-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50"
                  >
                    <PlusIcon aria-label="Add" className="h-4" />
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
