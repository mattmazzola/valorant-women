import type { LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import StaticRating from '~/components/StaticRating'
import StaticRatings from '~/components/StaticRatings'
import { femaleAgents } from '~/constants'
import { getAgentNamesSortedByRating } from "~/helpers"
import { SavedSubmission } from '~/models'

type LoaderData = {
    submissions: SavedSubmission[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const submissions: SavedSubmission[] = []

    return {
        submissions,
    }
}

export default function RatingWomen() {
    const { submissions } = useLoaderData() as LoaderData
    const avgWomenRatingNames = getAgentNamesSortedByRating(submissions, femaleAgents)

    return (
        <>
            <section>
                <h2>What the People Think:</h2>
                <p>Based on the average of all the {submissions.length} ratings this is what the people think.</p>
                <StaticRating sortedAgentNames={avgWomenRatingNames} agents={femaleAgents} />
            </section>

            <section>
                <h2>Individual Ratings ({submissions.length})</h2>
                <p>Ratings by individual submissions.</p>
                <StaticRatings submissions={submissions} agents={femaleAgents} />
            </section>
        </>
    )
}
