import { DataFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import StaticRating from '~/components/StaticRating'
import StaticRatings from '~/components/StaticRatings'
import { maleAgents } from '~/constants'
import { getAgentNamesSortedByRating } from "~/helpers"
import { auth, commitSession, getSession } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"
import { getRatings } from "~/services/ratingsService"
import { hasUserSubmittedMaleRatingKey } from "../ratings"

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await managementClient.getUsers()
    const submissions = await getRatings("men")
    for (const submission of submissions) {
        const user = users.find(u => u.user_id === submission.userId)
        if (user) {
            submission.user = user
        }
    }

    const profile = await auth.isAuthenticated(request, {
        failureRedirect: '/'
    })

    const hasUserSubmittedRating = Boolean(submissions.find(s => s.userId === profile.id))
    const session = await getSession(request.headers.get("Cookie"))
    session.set(hasUserSubmittedMaleRatingKey, hasUserSubmittedRating)

    return json({
        profile,
        submissions,
        hasUserSubmittedRating,
    }, {
        headers: {
            "Set-Cookie": await commitSession(session),
        }
    })
}

export default function RatingMen() {
    const { profile, submissions } = useLoaderData<typeof loader>()
    const avgMenRatingNames = getAgentNamesSortedByRating(submissions, maleAgents)

    return (
        <>
            <section>
                <h2>What the People Think:</h2>
                <p>Based on the average of all the {submissions.length} ratings this is what the people think.</p>
                <StaticRating
                    sortedAgentNames={avgMenRatingNames}
                    agents={maleAgents}
                />
            </section>

            <section>
                <h2>Individual Ratings ({submissions.length})</h2>
                <p>Ratings by individual submissions.</p>
                <StaticRatings
                    currentUserId={profile.id}
                    submissions={submissions}
                    agents={maleAgents}
                />
            </section>
        </>
    )
}
