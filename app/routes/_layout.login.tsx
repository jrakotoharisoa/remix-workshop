import { ActionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { commitSession, getSession } from "~/utils/user-session.server";

const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const url = new URL(request.url);
  const userSession = await getSession(request.headers.get("Cookie"));
  const parsedResult = LoginRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsedResult.success) {
    return json({ error: "Invalid request" });
  }

  const { username, password } = parsedResult.data;

  if (password !== "devoxx2023") {
    return json({ error: "Invalid password" });
  }

  userSession.set("username", username);
  userSession.flash("welcome", `Bienvenue ${username}`);

  return redirect(url.searchParams.get("from") || "/", {
    headers: {
      "Set-Cookie": await commitSession(userSession),
    },
  });
};

export default function Login() {
  const data = useActionData<typeof action>();

  return (
    <div>
      {data?.error ? <div className="error">{data.error}</div> : null}
      <Form method="post">
        <div>
          <p>Authentification</p>
        </div>
        <label>
          Utilisateur: <input name="username" />
        </label>
        <label>
          Mot de passe: <input type="password" name="password" />
        </label>

        <button type="submit">Soumettre</button>
      </Form>
    </div>
  );
}
