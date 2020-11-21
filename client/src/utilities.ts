import { Agent } from "./models"

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
        const agent = agents.find(a => a.name === agentName)
        if (!agent) {
            throw new Error(`Agent of name ${agentName} was not found`)
        }

        return agent
    })

    return chosenAgentList
}