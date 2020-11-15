export type Rating<T> = [T, T, T, T, T, T, T]

export type Submission<T> = {
    name: string
    rating: Rating<T>
}

export type ResolvedSubmission = {
    name: string
    agents: Rating<Agent>
}

export type Agent = {
    id: string
    name: string
    imageUrl: string
}