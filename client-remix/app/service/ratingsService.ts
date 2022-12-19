import invariant from "tiny-invariant"
import { SavedSubmission, Submission } from "~/models"

invariant(typeof process.env.API_URL === 'string', `env.API_URL must be a non-empty string`)
const apiBaseUrl = process.env.API_URL

export async function getRatings(sex: "men" | "women"): Promise<SavedSubmission[]> {
    const request = await fetch(`${apiBaseUrl}/ratings?gender=${sex}`)
    const json = await request.json()

    return json
}

export async function postRating(
    rating: Submission,
    signature: string,
    credentialId: string,
    publicKey: string,
    algorithm: string,
    authenticatorData: string,
    clientData: string,
): Promise<SavedSubmission> {
    const response = await fetch(`${apiBaseUrl}/ratings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-webauthn-signature': signature,
            'x-webauthn-credentialid': credentialId,
            'x-webauthn-publickey': publicKey,
            'x-webauthn-algorithm': algorithm,
            'x-webauthn-authenticatordata': authenticatorData,
            'x-webauthn-clientdata': clientData,
        },
        body: JSON.stringify(rating)
    })

    const json = await response.json()

    return json
}