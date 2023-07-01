import { useUser } from "@clerk/remix"
import { createClerkClient } from "@clerk/remix/api.server"
import { getAuth } from "@clerk/remix/ssr.server"
import { LoaderArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import StaticRating from '~/components/StaticRating'
import StaticRatingsList from '~/components/StaticRatingsList'
import { femaleAgents } from '~/constants'
import { getAgentNamesSortedByRating } from "~/helpers"
import { commitSession, getSession } from "~/services/auth.server"
import { getRatings } from "~/services/ratingsService"
import { hasUserSubmittedFemaleRatingKey } from "../ratings"

export const loader = async (args: LoaderArgs) => {
  const { userId } = await getAuth(args)
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
  })
  const users = await clerkClient.users.getUserList()
  const submissions = await getRatings("women")
  for (const submission of submissions) {
    const user = users.find(u => u.id === submission.userId)
    if (user) {
      submission.user = user
    }
  }

  const session = await getSession(args.request.headers.get("Cookie"))

  let hasUserSubmittedRating = true
  if (userId) {
    hasUserSubmittedRating = Boolean(submissions.find(s => s.userId === userId))
    session.set(hasUserSubmittedFemaleRatingKey, hasUserSubmittedRating)
  }

  return json({
    submissions,
    hasUserSubmittedRating,
  }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  })
}

export default function RatingWomen() {
  const { submissions } = useLoaderData<typeof loader>()
  const { user } = useUser()
  const avgWomenRatingNames = getAgentNamesSortedByRating(submissions, femaleAgents)

  return (
    <>
      <section>
        <h2>What the People Think:</h2>
        <p>Based on the average of all the {submissions.length} ratings this is what the people think.</p>
        <StaticRating
          sortedAgentNames={avgWomenRatingNames}
          agents={femaleAgents}
        />
      </section>

      <section>
        <h2>Individual Ratings ({submissions.length})</h2>
        <p>Ratings by individual submissions.</p>
        <StaticRatingsList
          currentUserId={user?.id}
          submissions={submissions as any[]}
          agents={femaleAgents}
        />
      </section>
    </>
  )
}
