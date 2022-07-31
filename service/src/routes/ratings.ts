import * as fastify from 'fastify'
import { v4 as uuidV4 } from 'uuid'
import * as constants from '../constants'
import { STATE_STORE_NAME } from '../constants'
import * as models from "../models"

const plugin: fastify.FastifyPluginCallback = (fastify, pluginOptions, done) => {

    fastify.get(
        '/',
        {
            schema: {
                querystring: {
                    gender: {
                        type: 'string'
                    }
                }
            }
        },
        async (req, rep) => {
            const isWomen = (req.query as any).gender !== "men"

            // https://docs.dapr.io/reference/api/state_api/#query-state
            const ratings = await fastify.daprClient.state.query(STATE_STORE_NAME, {
                filter: {
                    EQ: {
                        "rating.isWomen": isWomen
                    }
                },
                sort: [
                    {
                        key: "createdAtMs",
                        order: "DESC"
                    }
                ],
                page: {
                    limit: 10
                }
            })

            return ratings
        })

    fastify.post(
        '/',
        {
            schema: {
            }
        },
        async (req, rep) => {
            const ratingInput = req.body as models.rating.Input

            const agents = ratingInput.isWomen
                ? constants.femaleAgents
                : constants.maleAgents

            console.log({ ratingInput, agents })

            const containsAllAgents = agents.every(agent => ratingInput.rankedAgentNames.includes(agent))
            if (!containsAllAgents) {
                rep.code(400)

                return {
                    error: {
                        message: `You attempted to submit a rating that did not include all the agents`
                    }
                }
            }

            const rating: models.rating.Output = {
                ...ratingInput,
                id: uuidV4(),
                createdAtMs: Date.now()
            }

            await fastify.daprClient.state.save(STATE_STORE_NAME, [
                {
                    key: rating.id,
                    value: rating
                }
            ])

            return rating
        })

    done()
}

export default plugin