import dotenv from "dotenv-flow"
import * as fastify from "fastify"
import fp from "fastify-plugin"
import path from "path"
import * as TORM from "typeorm"

dotenv.config()

const plugin: fastify.FastifyPluginCallback = async (instance, pluginOptions, done) => {

    const host = process.env.TYPEORM_HOST ?? "localhost"
    const port = 1433
    const username = process.env.TYPEORM_USERNAME ?? "SA"
    const password = process.env.TYPEORM_PASSWORD ?? "<YourStrong@Passw0rd>"
    const database = process.env.TYPEORM_DATABASE ?? "womenofvalorant"

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