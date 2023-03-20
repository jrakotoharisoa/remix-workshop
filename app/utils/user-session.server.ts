import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__devoxx-remix",
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secrets: ["jx!bnVNNqJ%4q0&8W6FoMOh!YeBGf&t#swtf&p#ORC"],
    secure: true,
  },
});

export { getSession, commitSession, destroySession };
