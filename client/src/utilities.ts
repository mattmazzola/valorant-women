import { Agent, SavedSubmission } from "./models"

export function shuffle<T>(xs: T[]): T[] {

    // Copy to prevent mutation of input
    const copy = [...xs]
    const shuffled: T[] = []

    while (copy.length > 0) {
        // get random index from existing set
        const randomIndex = Math.floor(Math.random() * copy.length)
        // get item and move to new list
        const [x] = copy.splice(randomIndex, 1)

        shuffled.push(x)
    }

    return shuffled
}

export function convertNamesToAgents(agentNames: string[], agents: Agent[]): Agent[] {
    const chosenAgentList = agentNames.map<Agent>(agentName => {
        const agent = agents.find(a => a.id === agentName)
        if (!agent) {
            throw new Error(`Agent of name ${agentName} was not found`)
        }

        return agent
    })

    return chosenAgentList
}

export function getAgentNamesSortedByRating(submissions: SavedSubmission[], agents: Agent[]): string[] {
    const zeroRatings = agents.reduce<Record<string, number>>((aggregate, agent) => {
        aggregate[agent.id] = 0
        return aggregate
    }, {})

    const totalRatings = submissions.reduce((totals, submission) => {
        for (const [i, a] of submission.rankedAgentNames.entries()) {
            totals[a] += i
        }

        return totals
    }, { ...zeroRatings })

    const avgRatings = { ...totalRatings }
    Object.entries(avgRatings)
        .forEach(([key, value]) => {
            avgRatings[key] = value / submissions.length
        })


    const avgRatingNames = Object.entries(avgRatings)
        .sort(([key1, v1], [key2, v2]) => v1 - v2)
        .map(([key]) => key)

    return avgRatingNames
}