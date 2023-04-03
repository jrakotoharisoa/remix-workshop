import { ActionArgs, ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { commitSession, getSession } from "~/utils/user-session.server";
import { twMerge } from "tailwind-merge";

const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type FormError = { errors: { username?: string[]; password?: string[] } };
export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const url = new URL(request.url);
  const userSession = await getSession(request.headers.get("Cookie"));
  const parsedResult = LoginRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsedResult.success) {
    return json<FormError>({ errors: parsedResult.error.formErrors.fieldErrors });
  }

  const { username, password } = parsedResult.data;

  if (password !== "devoxx2023") {
    return json<FormError>({ errors: { password: ["Invalid password"] } });
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
      <Form method="post" className="flex flex-col items-start space-y-3 px-6 py-3">
        <div>
          <p>Authentification</p>
        </div>
        <label>
          Utilisateur: <input name="username" className={twMerge("border-2", data?.errors.username && "border-rose-500")} />
        </label>
        <label>
          Mot de passe:{" "}
          <input type="password" className={twMerge("border-2", data?.errors.password && "border-rose-500")} name="password" />
        </label>

        <button type="submit">Soumettre</button>
      </Form>
      {data ? <div>Result : {Object.keys(data.errors).length === 0 ? "success" : "fail"}</div> : null}
    </div>
  );
}
