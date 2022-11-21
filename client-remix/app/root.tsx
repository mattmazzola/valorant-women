import { ErrorBoundaryComponent, json, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node"
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
  { rel: 'manifest', href: 'manifest.json' },
  { rel: 'apple-touch-icon', href: 'logo.jpg' },
  { rel: 'stylesheet', href: rootStyles },
]

type LoaderData = {
  activeSex: string
  ENV: Record<string, string>
}

export const loader: LoaderFunction = async ({ request }) => {
  const activeSex = await getActiveSex(request)

  return json({
    activeSex,
    ENV: {
    },
  })
}

export const CatchBoundary: CatchBoundaryComponent = () => {
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
        <Scripts />
      </body>
    </html>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
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
      </body>
    </html>
  )
}

export default function App() {
  const { activeSex, ENV } = useLoaderData<LoaderData>()

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
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <script src="https://cdn.passwordless.dev/dist/0.2.0/passwordless.iife.js" crossOrigin="anonymous" ></script>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

declare global {
  interface Window {
    Passwordless: {
      Client: Function
    }

    ENV: {
      API_KEY: string
      API_URL: string
    }
  }
}