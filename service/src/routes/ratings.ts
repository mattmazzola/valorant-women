import * as fastify from 'fastify'
import * as models from "../models"
import { Rating } from '../entity'
import * as constants from '../constants'

const plugin: fastify.FastifyPluginCallback = (fastify, pluginOptions, done) => {
    const connection = fastify.connection

    fastify.get(
        '/',
        {},
        async (req, rep) => {
            const ratings = await connection.manager.find(Rating)

            return ratings
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

            const containsAllAgenths = constants.agents.every(agent => ratingInput.names.includes(agent))
            if (!containsAllAgenths) {
                rep.code(400)

                return {
                    error: {
                        message: `You attempted to submit a rating that did not include all the agents`
                    }
                }
            }

            const ratingEntity = new Rating()
            ratingEntity.username = ratingInput.username
            ratingEntity.names = ratingInput.names

            const savedRating = await connection.manager.save(ratingEntity)

            return savedRating
        })

    done()
}

export default plugin