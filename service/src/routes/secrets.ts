import * as fastify from 'fastify'
import { SECRET_STORE_NAME } from '../constants'

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

    done()
}

export default plugin