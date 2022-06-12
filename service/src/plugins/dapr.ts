import { CommunicationProtocolEnum, DaprClient } from '@dapr/dapr'
import dotenv from "dotenv-flow"
import * as fastify from "fastify"
import fp from "fastify-plugin"
import invariant from "tiny-invariant"

dotenv.config()

const plugin: fastify.FastifyPluginCallback = async (instance, pluginOptions, done) => {
    const host = process.env.DAPR_HOST
    const port = process.env.DAPR_HTTP_PORT

    instance.log.info(`
    Connecting to SQL server:
\t - server: ${host}
\t - port: ${port}
    `)

    invariant(typeof host === 'string', `host is a string`)
    invariant(typeof port === 'string', `port is a string`)

    const daprClient = new DaprClient(host, port, CommunicationProtocolEnum.HTTP)

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