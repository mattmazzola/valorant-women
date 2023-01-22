import { DataFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import StaticRating from '~/components/StaticRating'
import StaticRatingsList from '~/components/StaticRatingsList'
import { femaleAgents } from '~/constants'
import { getAgentNamesSortedByRating } from "~/helpers"
import { SavedSubmission } from '~/models'
import { auth, commitSession, getSession } from "~/services/auth.server"
import { managementClient } from "~/services/auth0management.server"
import { getRatings } from "~/services/ratingsService"
import { hasUserSubmittedFemaleRatingKey } from "../ratings"

type LoaderData = {
    submissions: SavedSubmission[]
}

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await managementClient.getUsers()
    const submissions = await getRatings("women")
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
    session.set(hasUserSubmittedFemaleRatingKey, hasUserSubmittedRating)

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

export default function RatingWomen() {
    const { profile, submissions } = useLoaderData<typeof loader>()
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
                <StaticRatingsList currentUserId={profile.id} submissions={submissions} agents={femaleAgents} />
            </section>
        </>
    )
}
