import { defaultSex, femaleSex, maleSex } from "~/constants"
import { Agent, SavedSubmission, Submission } from "./models"
import { getFormData } from "./utilities"

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

export function getAgentNamesSortedByRating(submissions: Omit<SavedSubmission, 'user'>[], agents: Agent[]): string[] {
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

export async function getActiveSex(request: Request) {
    const url = new URL(request.url)
    let activeSex: string

    if (url.pathname.toLowerCase().endsWith(`/${maleSex.toLowerCase()}`)) {
        activeSex = maleSex
    }
    else if (url.pathname.toLowerCase().endsWith(`/${femaleSex.toLowerCase()}`)) {
        activeSex = femaleSex
    }
    else {
        activeSex = url.searchParams.get("activeSex") ?? defaultSex
    }

    return activeSex
}

export function getObjectFromSubmission(submission: Submission): Record<string, string> {
    return getFormData(submission)
}

export function getSubmissionFromObject(object: Record<string, FormDataEntryValue>): Submission {
    const rankedAgentNameEntries = Object.entries(object)
        .filter(([k]) => k.startsWith('rankedAgentName'))
        .map(([k, v]) => {
            return {
                key: k,
                value: v as string,
                index: Number(k.slice(-1))
            }
        })
        .sort((a, b) => a.index - b.index)

    const submission: Submission = {
        isWomen: object['isWomen'] === 'true',
        rankedAgentNames: rankedAgentNameEntries.map(entry => entry.value)
    }

    return submission
}
