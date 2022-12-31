import invariant from "tiny-invariant"
import { SavedSubmission, Submission } from "~/models"

invariant(typeof process.env.API_URL === 'string', `env.API_URL must be a non-empty string`)
const apiBaseUrl = process.env.API_URL

export async function getRatings(sex: "men" | "women"): Promise<SavedSubmission[]> {
    // const request = await fetch(`${apiBaseUrl}/ratings?gender=${sex}`)
    // const json = await request.json()

    // return json

    return []
}

export async function postRating(rating: Submission): Promise<SavedSubmission> {
    const request = await fetch(`${apiBaseUrl}/ratings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rating)
    })

    const json = await request.json()

    return json
}