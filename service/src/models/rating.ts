import S from "fluent-schema"
import * as constants from '../constants'

export type Input = {
    userName: string
    rankedAgentNames: string[]
}


export const InputSchema = S.object()
    .prop('userName', S.string().required())
    .prop('rankedAgentNames', S.array()
        .items(S.string())
        .minItems(constants.agents.length)
        .maxItems(constants.agents.length)
        .uniqueItems(true)
        .required())