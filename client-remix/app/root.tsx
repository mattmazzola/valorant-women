import { cssBundleHref } from "@remix-run/css-bundle"
import { LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react"

import { ClerkApp, V2_ClerkErrorBoundary } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"

import { getActiveSex } from "~/helpers"
import rootStyles from "./styles/root.css"

export const meta: V2_MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { viewport: "width=device-width,initial-scale=1" },
    { icon: "/favicon.ico" },
    { title: "Women of Valorant" },
    { name: "description", content: "Rank the characters of Valorant" },
  ]
}

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: 'manifest', href: '/manifest.json' },
  { rel: 'apple-touch-icon', href: '/logo.jpg' },
  { rel: 'stylesheet', href: rootStyles },
]

export const loader = async (args: LoaderArgs) => {
  const activeSex = await getActiveSex(args.request)

  return rootAuthLoader(
    args,
    () => json({ activeSex }),
    {
      loadUser: true,
    })
}

const CustomErrorBoundary = () => {
  const error = useRouteError()
  let errorName: string
  let errorJsx: React.ReactNode

  if (isRouteErrorResponse(error)) {
    errorName = (error as any)?.name ?? error?.data.name
    errorJsx = (
      <div className="center">
        <h1>
          Error: {error.status} {error.statusText}
        </h1>
        <Link to="/" className="orangeButton">Go Home</Link>
      </div>
    )
  }
  else {
    errorName = (error as any)?.name
    errorJsx = (
      <div className="center">
        <h1>Error</h1>
        <p>{(error as any)?.message}</p>
        <p>The stack trace is:</p>
        <pre>{(error as any)?.stack}</pre>
      </div>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>{`Women of Valorant: ${errorName}`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        {errorJsx}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary = V2_ClerkErrorBoundary(CustomErrorBoundary)

function App() {
  const { activeSex } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <title>{`${activeSex} of Valorant`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="center">
          <header>
            <h1>Rate the {activeSex} of Valorant</h1>
          </header>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default ClerkApp(App, {

})
