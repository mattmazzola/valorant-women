import * as fastify from 'fastify'
import { v4 as uuidV4 } from 'uuid'
import * as constants from '../constants'
import { SECRET_STORE_NAME, STATE_STORE_NAME } from '../constants'
import * as models from "../models"

const plugin: fastify.FastifyPluginCallback = (fastify, pluginOptions, done) => {

    fastify.get(
        '/',
        {},
        async (req, rep) => {
            const cosmosKey = await fastify.daprClient.secret.get(SECRET_STORE_NAME, 'cosmosKey')
            const allSecrets = await fastify.daprClient.secret.getBulk(SECRET_STORE_NAME)

            return {
                cosmosKey,
                allSecrets,
            }
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

            console.log('Saved counter value', { rating })

            return rating
        })

    done()
}

export default plugin