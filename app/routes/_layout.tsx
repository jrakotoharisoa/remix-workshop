import { json, LoaderArgs } from "@remix-run/node";
import { Form, NavLink, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { ExitIcon } from "~/ui/icons/Exit";
import { MusicIcon } from "~/ui/icons/Music";
import { PlaylistIcon } from "~/ui/icons/Playlist";
import { db } from "~/utils/db.server";
import { getSession } from "~/utils/user-session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const isLogged = session.has("username");
  const playlists = await db.playlist.findMany();
  return json({ playlists, isLogged });
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  return <>{error instanceof Error ? error.message : "An unexpected error occured"}</>;
};

export default function Layout() {
  const { playlists, isLogged } = useLoaderData<typeof loader>();

  return (
    <div className="grid h-full grid-cols-4 xl:grid-cols-5">
      <aside>
        <div className="px-8 py-6">
          <p className="title-1 flex items-center space-x-2">
            <MusicIcon className="h-6 w-6" />
            <span>Remix</span>
          </p>
          <p className="flex items-center space-x-2">
            {isLogged && (
              <Form method="post" action="/api/logout">
                <button type="submit">
                  <span className="sr-only">Logout</span>
                  <ExitIcon className="h-6 w-6" />
                </button>
              </Form>
            )}
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
                      prefetch="intent"
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

      <main className="col-span-3 h-full border-l border-l-slate-200 xl:col-span-4">
        <Outlet />
      </main>
    </div>
  );
}
