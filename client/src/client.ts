import { Submission, SavedSubmission } from './models'

const baseUrl = process.env.REACT_APP_BASE_URL!

export async function getRatings(): Promise<SavedSubmission[]> {
    const response = await fetch(`${baseUrl}/ratings`)

    if (!response.ok) {
        throwError(`GET /ratings failed.`, response)

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
        throwError(`POST to /ratings failed.`, response)
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