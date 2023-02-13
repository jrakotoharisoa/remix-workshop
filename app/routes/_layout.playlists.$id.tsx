import { LoaderArgs, json, ActionFunction, ActionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { z } from "zod";
/// TODO: gestion d'erreur avec playlist non trouvée

export const loader = async ({ params: { id = "" } }: LoaderArgs) => {
  const playlists = await db.playlist.findUnique({
    where: { id },
    include: {
      tracks: true,
    },
  });
  return json(playlists);
};

const FormDataRequestSchema = z.object({
  track_id: z.string(),
});

export const action = async ({ request, params: { id = "" } }: ActionArgs) => {
  const rawFormData = Object.fromEntries(await request.formData());
  const formData = FormDataRequestSchema.parse(rawFormData);

  await db.playlist.update({
    where: { id },
    data: {
      tracks: {
        disconnect: [{ id: formData.track_id }],
      },
    },
  });

  return null;
};

export default function Playlist() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="title-1">{data?.name}</h1>
      <ul>
        {data?.tracks.map((track) => (
          <li key={track.id}>
            <Form method="post" className="space-x-4">
              <span>
                {track.name} · {track.artist}
              </span>
              <input name="track_id" type="hidden" value={track.id} />
              <button type="submit" name="action" value="delete">
                Retirer
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </>
  );
}
