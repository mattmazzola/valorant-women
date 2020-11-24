
export type Submission = {
    userName: string
    isWomen: boolean
    rankedAgentNames: string[]
}

export type SavedSubmission =
    Submission
    & {
        id: number
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

