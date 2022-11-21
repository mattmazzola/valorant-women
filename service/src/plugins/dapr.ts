import { CommunicationProtocolEnum, DaprClient } from '@dapr/dapr'
import dotenv from "dotenv-flow"
import * as fastify from "fastify"
import fp from "fastify-plugin"
import invariant from "tiny-invariant"

dotenv.config()

const plugin: fastify.FastifyPluginCallback = async (instance, pluginOptions, done) => {
    const daprHost = process.env.DAPR_HOST
    const daprPort = process.env.DAPR_HTTP_PORT

    invariant(typeof daprHost === 'string', `env var DAPR_HOST must be a string`)
    invariant(typeof daprPort === 'string', `env var DAPR_HTTP_PORT must be a string`)

    const daprClient = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP)

    instance
        .decorate('daprClient', daprClient)

    done()
}

declare module 'fastify' {
    export interface FastifyInstance {
        daprClient: DaprClient
    }
}

export default fp(plugin)