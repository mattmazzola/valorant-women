import invariant from "tiny-invariant"
import wretch from "wretch"
import { SavedSubmission, Submission } from "~/models"

invariant(typeof process.env.API_URL === 'string', `env.API_URL must be a non-empty string`)
const apiBaseUrl = process.env.API_URL

export async function getRatings(sex: "men" | "women") {
    const rating = await wretch(`${apiBaseUrl}/ratings?gender=${sex}`)
        .get()
        .json<SavedSubmission[]>()

    return rating
}

export async function postRating(rating: Submission, userId?: string): Promise<SavedSubmission> {
    if (typeof userId !== 'string') {
        throw new Error(`You attempted to submit a new rating but your user ID was not specified. Please try again.`)
    }

    const request = await fetch(`${apiBaseUrl}/ratings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...rating, userId })
    })

    const json = await request.json()
    if (!request.ok) {
        throw json.message
    }

    return json
}