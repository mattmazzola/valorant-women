import "reflect-metadata"
import fastify from "fastify"
import dotenv from "dotenv"
import ormPlugin from "./plugins/orm"

dotenv.config()

process.on('unhandledRejection', error => {
    throw error
})

const defaultPort = 3002
const port = process.env.PORT
    ? parseInt(process.env.PORT)
    : defaultPort

async function main() {

    const server = fastify({
        logger: {
            // redact: ['req.headers.authorization'],
            prettyPrint: true,
            // level: ['info']
        },
        caseSensitive: false,
    })

    server.register(ormPlugin)
        .after(err => {
            if (err) throw err
        })

    server.get('/', async (request, reply) => {
        return { hello: 'world' }
    })

    try {
        await server.listen(port)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

main()