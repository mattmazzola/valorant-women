export async function getToken(baseUrl: string, alias: string): Promise<string> {
    const backendRequest = await fetch(`${baseUrl}/create-token?alias=${alias}`)
    const backendResponse = await backendRequest.text()
    if (!backendRequest.ok) {
        throw new Error(backendResponse)
    }

    return backendResponse
}

export async function getUser(baseUrl: string, token: string): Promise<object> {
    const userResponse = await fetch(`${baseUrl}/verify-signin?token=${token}`)
    const user = await userResponse.json()

    return user
}