
export type Submission<T> = {
    name: string
    datetime: number
    rating: T[]
}

export type ResolvedSubmission = {
    name: string
    datetime: number
    agents: Agent[]
}

export type Agent = {
    id: string
    name: string
    imageUrl: string
}