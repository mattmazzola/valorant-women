import { LoaderFunction, redirect } from "@remix-run/node"
import { destroySession, getSession } from "~/sessions"

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"))
  const url = new URL(request.url)
  console.log(`Logout`, { sr: url.searchParams.toString() })

  return redirect(`/?${url.searchParams}`, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  })
}

