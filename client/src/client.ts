import { SavedSubmission, Submission } from './models'

const baseUrl = process.env.REACT_APP_SERVICE_BASE_URL!

export async function getRatings(gender: "women" | "men" = "women"): Promise<SavedSubmission[]> {
    const response = await fetch(`${baseUrl}/ratings?gender=${gender}`)

    if (!response.ok) {
        return throwError(`GET /ratings failed.`, response)
    }

    const json = await response.json()
    const submissions = json as SavedSubmission[]

    return submissions
}

export async function postRating(rating: Submission): Promise<SavedSubmission> {
    const response = await fetch(`${baseUrl}/ratings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rating)
    })

    if (!response.ok) {
        return throwError(`POST to /ratings failed.`, response)
    }

    const json = await response.json()
    const savedSubmission = json as SavedSubmission

    return savedSubmission
}

async function throwError(message: string, response: Response): Promise<never> {
    let text: string

    try {
        const json = await response.json()
        text = JSON.stringify(json)
    }
    catch {
        text = await response.text()
    }

    throw new Error(`${message}\n\n${text}`)
}