import * as fastify from 'fastify'
import * as constants from '../constants'
import { Rating } from '../entity'
import * as models from "../models"

const plugin: fastify.FastifyPluginCallback = (fastify, pluginOptions, done) => {
    const connection = fastify.connection

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
            const isWomen = (req.query as any).gender === "men"
                ? false : true
            // const ratings = await connection.manager.find(Rating, { where: { isWomen } })

            return []
        })

    fastify.post(
        '/',
        {
            schema: {
                body: models.rating.InputSchema
            }
        },
        async (req, rep) => {
            const ratingInput = req.body as models.rating.Input

            const agents = ratingInput.isWomen
                ? constants.femaleAgents
                : constants.maleAgents

            const containsAllAgents = agents.every(agent => ratingInput.rankedAgentNames.includes(agent))
            if (!containsAllAgents) {
                rep.code(400)

                return {
                    error: {
                        message: `You attempted to submit a rating that did not include all the agents`
                    }
                }
            }

            const ratingEntity = new Rating()
            ratingEntity.userName = ratingInput.userName
            ratingEntity.isWomen = ratingInput.isWomen
            ratingEntity.rankedAgentNames = ratingInput.rankedAgentNames

            // const savedRating = await connection.manager.save(ratingEntity)

            return ratingEntity
        })

    done()
}

export default plugin