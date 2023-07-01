import { cssBundleHref } from "@remix-run/css-bundle"
import { ErrorBoundaryComponent, LinksFunction, LoaderArgs, MetaFunction, json } from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData
} from "@remix-run/react"

import { ClerkApp, ClerkCatchBoundary } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"

import { CatchBoundaryComponent } from "@remix-run/react/dist/routeModules"
import { getActiveSex } from "~/helpers"
import rootStyles from "./styles/root.css"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Women of Valorant",
  viewport: "width=device-width,initial-scale=1",
  description: "Rank the characters of Valorant",
  icon: "/favicon.ico",
})

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: 'manifest', href: 'manifest.json' },
  { rel: 'apple-touch-icon', href: 'logo.jpg' },
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

const CustomCatchBoundary: CatchBoundaryComponent = () => {
  const caught = useCatch()

  return (
    <html>
      <head>
        <title>{`Women of Valorant: ${caught.status}`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="center">
          <h1>
            Error: {caught.status} {caught.statusText}
          </h1>
          <Link to="/" className="orangeButton">Go Home</Link>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const CatchBoundary = ClerkCatchBoundary(CustomCatchBoundary)

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }: any) => {
  return (
    <html lang="en">
      <head>
        <title>{`Women of Valorant: ${error.name}`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="center">
          <h1>Error</h1>
          <p>{error.message}</p>
          <p>The stack trace is:</p>
          <pre>{error.stack}</pre>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

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
