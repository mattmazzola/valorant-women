import { DataFunctionArgs, redirect } from "@remix-run/node"

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url)
  const urlSearchParamsString = [...url.searchParams.entries()].length > 0
    ? `?${url.searchParams}`
    : ''

  return redirect(`ratings${urlSearchParamsString}`)
}
