import { ActionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/utils/user-session.server";

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
