import { json, LoaderArgs } from "@remix-run/node";
import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ExitIcon } from "~/ui/icons/Exit";
import { MusicIcon } from "~/ui/icons/Music";
import { PlaylistIcon } from "~/ui/icons/Playlist";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const playlists = await db.playlist.findMany();
  return json({ playlists });
};

export default function Layout() {
  const { playlists } = useLoaderData<typeof loader>();

  return (
    <div className="grid h-full grid-cols-4 xl:grid-cols-5">
      <aside>
        <div className="px-8 py-6">
          <p className="title-1 flex items-center space-x-2">
            <MusicIcon className="h-6 w-6" />
            <span>Remix</span>
          </p>
        </div>
        <div className="py-2 px-8">
          <h2 className="title-2">Playlists </h2>
          <div dir="ltr" className="relative overflow-hidden ">
            <div data-radix-scroll-area-viewport="" className="h-full w-full rounded-[inherit]">
              <div>
                <div className="space-y-1 p-2">
                  {playlists.map((playlist) => (
                    <NavLink
                      key={playlist.id}
                      to={`/playlists/${playlist.id}`}
                      className={
                        "inline-flex h-9 w-full items-center justify-start rounded-md bg-transparent px-2 text-sm font-normal transition-colors hover:bg-slate-100  focus:outline-none  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-transparent"
                      }
                    >
                      <PlaylistIcon className="mr-2 h-4 w-4" />
                      {playlist.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
