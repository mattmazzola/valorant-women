
export type Submission<T> = {
    name: string
    rating: T[]
}

export type ResolvedSubmission = {
    name: string
    agents: Agent[]
}

export type Agent = {
    id: string
    name: string
    imageUrl: string
}