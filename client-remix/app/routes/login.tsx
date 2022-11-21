import { LoaderFunction, redirect } from "@remix-run/node"
import { commitSession, getSession } from "~/sessions"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)

  const session = await getSession(request.headers.get("Cookie"))

  // Simulate login as random user
  const userId = `userId_${Math.floor(Math.random() * 1000000)}`
  session.set('userId', userId)

  console.log(`Set userId ${userId} on session`, { searchParams: url.searchParams.toString() })

  return redirect(`rating?${url.searchParams}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  })
}

