import { ErrorResponse, SqlQuerySpec } from '@azure/cosmos'
import * as fastify from 'fastify'
import { v4 as uuidV4 } from 'uuid'
import * as constants from '../constants'
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

            const selectRatingsOfGender: SqlQuerySpec = {
                query: "SELECT * FROM ratings r WHERE r.isWomen = @isWomen",
                parameters: [
                    { name: "@isWomen", value: isWomen }
                ]
            }

            console.log({ selectRatingsOfGender })

            const ratingsResponse = await fastify.cosmosContainer.items
                .query<models.rating.Output>(selectRatingsOfGender)
                .fetchAll()

            return ratingsResponse.resources
        })

    fastify.post(
        '/',
        {
            schema: {
            }
        },
        async (req, rep) => {
            const ratingInput = req.body as models.rating.Input

            const expectedAgentNames = ratingInput.isWomen
                ? constants.femaleAgents
                : constants.maleAgents

            console.log({ ratingInput, expectedAgentNames })

            const containsAllAgents = expectedAgentNames.every(agent => ratingInput.rankedAgentNames.includes(agent))
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

            try {
                const savedRating = await fastify.cosmosContainer.items.create(rating)

                console.log('Saved rating', { savedRating })

                return savedRating.resource
            }
            catch (e) {
                const cosmosError: ErrorResponse = e as any

                if (cosmosError.code === 409) {
                    rep.status(409)
                    
                    return { message: `You attempted to create rating with user id: ${ratingInput.userId}. The creation failed due to conflict because user has already created a rating.` }
                }
                else {
                    throw e
                }
            }
        })

    done()
}

export default plugin