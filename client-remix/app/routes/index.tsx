import { DataFunctionArgs, redirect } from "@remix-run/node"

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url)

  return redirect(`ratings${[...url.searchParams.entries()].length > 0 ? `?${url.searchParams}` : ''}`)
}
