import { LoaderFunction, redirect } from "@remix-run/node"
import { getActiveSex } from "~/helpers"

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url)
    // TODO: Is there browser utility for URL manipulation that resolves double slashes?
    const baseUrl = url.pathname.endsWith('/')
        ? url.pathname.slice(0, -1)
        : url.pathname

    const activeSex = await getActiveSex(request)
    const urlSearchParamsString = [...url.searchParams.entries()].length > 0
        ? `?${url.searchParams}`
        : ''

    const childRoute = `${baseUrl}/${activeSex.toLowerCase()}${urlSearchParamsString}`

    return redirect(childRoute)
}
