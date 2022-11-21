
export type Submission = {
    isWomen: boolean
    rankedAgentNames: string[]
}

export type SavedSubmission =
    Submission
    & {
        id: number
        userId: string
        userName: string
        createdAt: string
    }

export type Resolved<T> =
    Omit<T, 'rankedAgentNames'>
    & {
        rankedAgents: Agent[]
    }

export type Agent = {
    id: string
    name: string
    imageUrl: string
}

export type User = {
    id: string
    name: string
}