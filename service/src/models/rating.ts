import S from "fluent-schema"
import * as constants from '../constants'

export type Input = {
    isWomen: boolean
    userName: string
    rankedAgentNames: string[]
}

export type Output =
    | Input
    & {
        id: string
        createdAtMs: number
    }

const [minList, maxList] = constants.femaleAgents.length < constants.maleAgents.length
    ? [constants.femaleAgents, constants.maleAgents]
    : [constants.maleAgents, constants.femaleAgents]

export const InputSchema = S.object()
    .prop('userName', S.string().required())
    .prop('isWomen', S.boolean().required())
    .prop('rankedAgentNames', S.array()
        .items(S.string())
        .minItems(minList.length)
        .maxItems(maxList.length)
        .uniqueItems(true)
        .required())
