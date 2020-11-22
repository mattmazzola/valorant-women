import path from "path"
import * as fastify from "fastify"
import fp from "fastify-plugin"
import * as TORM from "typeorm"
import dotenv from "dotenv"

dotenv.config()

const defaultConnection = 'local'
const connectionName = process.env.DB_CONNECTION_NAME ?? defaultConnection

const plugin: fastify.FastifyPluginCallback = async (instance, pluginOptions, done) => {
    const connectionOptions = await TORM.getConnectionOptions(connectionName)
    if (connectionOptions.type !== "mssql") {
        throw Error(`Connection options type did not match database type.`)
    }

    instance.log.info(`Connecting to servier: ${connectionOptions.host} username: ${connectionOptions.username} database: ${connectionOptions.database}`)
    const connection = await TORM.createConnection({
        type: connectionOptions.type,
        host: connectionOptions.host,
        username: connectionOptions.username,
        password: process.env.DB_PASSWORD ?? connectionOptions.password,
        database: connectionOptions.database,

        maxQueryExecutionTime: 1000,
        synchronize: true,
        // dropSchema: true,
        logging: ["error", "warn"],
        entities: [
            path.join(__dirname, "../entity/**/*")
        ],
        migrations: [
            path.join(__dirname, "../migration/**/*")
        ],
        options: {
            "encrypt": true,
            "enableArithAbort": true,
        }
    })

    instance
        .decorate('connection', connection)
    // .addHook('onClose', async (instance2, done) => {
    //     await instance2.connection.close()
    //     done()
    // })

    done()
}

declare module 'fastify' {
    export interface FastifyInstance {
        connection: TORM.Connection
    }
}

export default fp(plugin)