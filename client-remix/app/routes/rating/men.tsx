import type { LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import StaticRating from '~/components/StaticRating'
import StaticRatings from '~/components/StaticRatings'
import { maleAgents } from '~/constants'
import { getAgentNamesSortedByRating } from "~/helpers"
import { SavedSubmission } from '~/models'
import { getRatings } from "~/service/ratingsService"

type LoaderData = {
    submissions: SavedSubmission[]
}

export const loader: LoaderFunction = async () => {
    const men = await getRatings("men")
    const submissions = men

    return {
        submissions,
    }
}

export default function RatingMen() {
    const { submissions } = useLoaderData() as LoaderData
    const avgMenRatingNames = getAgentNamesSortedByRating(submissions, maleAgents)

    return (
        <>
            <section>
                <h2>What the People Think:</h2>
                <p>Based on the average of all the {submissions.length} ratings this is what the people think.</p>
                <StaticRating sortedAgentNames={avgMenRatingNames} agents={maleAgents} />
            </section>

            <section>
                <h2>Individual Ratings ({submissions.length})</h2>
                <p>Ratings by individual submissions.</p>
                <StaticRatings submissions={submissions} agents={maleAgents} />
            </section>
        </>
    )
}
