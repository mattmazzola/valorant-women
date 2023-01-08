import { RemixBrowser } from "@remix-run/react"
import { startTransition } from "react"
import { hydrateRoot } from "react-dom/client"

function hydrate() {
  startTransition(() => {
    // TODO: <StrictMode /> is desired but it prevents react-dnd from working
    hydrateRoot(
      document,
      <RemixBrowser />
    )
  })
}

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1)
}
