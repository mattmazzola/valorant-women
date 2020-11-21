import S from "fluent-schema"
import * as constants from '../constants'

export type Input = {
    username: string
    names: string[]
}


export const InputSchema = S.object()
    .prop('username', S.string().required())
    .prop('names', S.array()
        .items(S.string())
        .minItems(constants.agents.length)
        .maxItems(constants.agents.length)
        .uniqueItems(true)
        .required())