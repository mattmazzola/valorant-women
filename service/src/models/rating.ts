import { z } from "zod"
import * as constants from '../constants'

export type Input = z.infer<typeof InputSchema>

export type Output =
    | Input
    & {
        id: string
        createdAtMs: number
    }

const [minList, maxList] = constants.femaleAgents.length < constants.maleAgents.length
    ? [constants.femaleAgents, constants.maleAgents]
    : [constants.maleAgents, constants.femaleAgents]

export const InputSchema = z.object({
    userId: z.string(),
    isWomen: z.boolean(),
    rankedAgentNames: z.array(z.string())
        .min(minList.length)
        .max(maxList.length)
})

