import { Container, CosmosClient, Database } from '@azure/cosmos'
import dotenv from "dotenv-flow"
import * as fastify from "fastify"
import fp from "fastify-plugin"
import invariant from "tiny-invariant"

dotenv.config()

const plugin: fastify.FastifyPluginCallback = async (instance, pluginOptions, done) => {
    const cosmosEndpoint = process.env.COSMOSDB_ACCOUNT
    const cosmosKey = process.env.COSMOSDB_KEY
    const cosmosDatabaseId = process.env.COSMOSDB_DATABASE_ID
    const cosmosContainerId = process.env.COSMOSDB_CONTAINER_ID

    invariant(typeof cosmosEndpoint === 'string', `env var COSMOSDB_ACCOUNT must be a string`)
    invariant(typeof cosmosKey === 'string', `env var COSMOSDB_KEY must be a string`)
    invariant(typeof cosmosDatabaseId === 'string', `env var COSMOSDB_DATABASE_ID must be a string`)
    invariant(typeof cosmosContainerId === 'string', `env var COSMOSDB_CONTAINER_ID must be a string`)

    const client = new CosmosClient({
        endpoint: cosmosEndpoint,
        key: cosmosKey,
    })

    const { database } = await client.databases.createIfNotExists({ id: cosmosDatabaseId });
    const { container } = await database.containers.createIfNotExists({ id: cosmosContainerId });

    instance
        .decorate('cosmosClient', client)
        .decorate('cosmosDatabase', database)
        .decorate('cosmosContainer', container)

    done()
}

declare module 'fastify' {
    export interface FastifyInstance {
        cosmosClient: CosmosClient
        cosmosDatabase: Database
        cosmosContainer: Container
    }
}

export default fp(plugin)