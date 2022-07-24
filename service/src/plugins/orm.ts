import dotenv from "dotenv-flow"
import * as fastify from "fastify"
import fp from "fastify-plugin"
import path from "path"
import invariant from "tiny-invariant"
import * as TORM from "typeorm"

const isProduction = process.env.NODE_ENV === 'production'
console.log({ isProduction })
if (!isProduction) {
    dotenv.config()
}

const plugin: fastify.FastifyPluginCallback = async (instance, pluginOptions, done) => {

    const host = process.env.TYPEORM_HOST
    const port = Number(process.env.TYPEORM_PORT)
    const username = process.env.TYPEORM_USERNAME
    const password = process.env.TYPEORM_PASSWORD
    const database = process.env.TYPEORM_DATABASE
    
    invariant(typeof host === 'string', `env var TYPEORM_HOST must be defined`)
    invariant(typeof port === 'number', `env var TYPEORM_PORT must be defined`)
    invariant(typeof username === 'string', `env var TYPEORM_USERNAME must be defined`)
    invariant(typeof password === 'string', `env var TYPEORM_PASSWORD must be defined`)
    invariant(typeof database === 'string', `env var TYPEORM_DATABASE must be defined`)

    instance.log.info(`
Connecting to SQL server:
- server: ${host}
- port: ${port}
- username: ${username}
- database: ${database}
`)

    const connection = await TORM.createConnection({
        type: "mssql",
        host,
        port,
        username,
        password,
        database,
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