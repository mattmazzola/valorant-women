import { SqlQuerySpec } from '@azure/cosmos'
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
            const signature = req.headers['x-webauthn-signature']
            const credentialId = req.headers['x-webauthn-credentialid'] as string
            const publicKey = req.headers['x-webauthn-publickey'] as string
            const algorithm = req.headers['x-webauthn-algorithm'] as string
            // const credentialDataDecoded = Buffer.from(credentialData, 'base64')
            const authenticatorData = req.headers['x-webauthn-authenticatordata'] as string
            // const authenticatorDataDecoded = Buffer.from(authenticatorData, 'base64')
            const clientData = req.headers['x-webauthn-clientdata'] as string
            // const clientDataDecoded = Buffer.from(clientData, 'base64')

            const expectedAgentNames = ratingInput.isWomen
                ? constants.femaleAgents
                : constants.maleAgents

            console.log({
                ratingInput,
                signature,
                credentialId,
                publicKey,
                algorithm,
                authenticatorData,
                clientData,
            })

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

            const savedRating = await fastify.cosmosContainer.items.create(rating);

            console.log({ savedRating: savedRating.resource })

            return savedRating.resource
        })

    done()
}

export default plugin