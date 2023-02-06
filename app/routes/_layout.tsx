import { Outlet } from "@remix-run/react";
import { MusicIcon } from "~/ui/icons/Music";
import { PlaylistIcon } from "~/ui/icons/Playlist";

export default function Layout() {
  return (
    <div className="grid grid-cols-4 xl:grid-cols-5 h-full">
      <aside>
        <div className="px-8 py-6">
          <p className="flex items-center text-2xl font-semibold tracking-tight space-x-2">
            <MusicIcon className="h-6 w-6" />
            <span>Playlist</span>
          </p>
        </div>
        <div className="py-2">
          <h2 className="relative px-8 text-lg font-semibold tracking-tight">
            Playlists{" "}
          </h2>
          <div dir="ltr" className="relative overflow-hidden px-4">
            <div
              data-radix-scroll-area-viewport=""
              className="h-full w-full rounded-[inherit]"
            >
              <div>
                <div className="space-y-1 p-2">
                  {playlists.map((p) => (
                    <button
                      key={p}
                      className="inline-flex items-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-transparent hover:bg-slate-100  data-[state=open]:bg-transparent  h-9 px-2 rounded-md w-full justify-start font-normal"
                    >
                      <PlaylistIcon className="mr-2 h-4 w-4" />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="h-full col-span-3 border-l border-l-slate-200 xl:col-span-4">
        <Outlet />
      </div>
    </div>
  );
}

const playlists = [
  "Recently Added",
  "Recently Played",
  "Top Songs",
  "Top Albums",
  "Top Artists",
  "Logic Discography",
  "Bedtime Beats",
  "Feeling Happy",
  "button>",
  "Runtober",
  "Mellow Days",
  "Eminem Essentials",
];
