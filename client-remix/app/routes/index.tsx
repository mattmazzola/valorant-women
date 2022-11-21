import { LoaderFunction, redirect } from "@remix-run/node"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)

  return redirect(`rating?${url.searchParams}`)
}
