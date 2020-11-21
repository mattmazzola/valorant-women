import "reflect-metadata"
import fastify from "fastify"
import fastifyCors from "fastify-cors"
import dotenv from "dotenv"
import plugin from "./plugins/orm"
import ratings from './routes/ratings'

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

    server.register(plugin)
        .after(err => {
            if (err) throw err
        })

    server.register(fastifyCors)
    server.register(ratings, { prefix: '/ratings' })

    server.get('/routes', async () => {
        return server.printRoutes()
    })

    server.get('/', async (request, reply) => {
        return `Women of Valorant server running... ${new Date().toLocaleDateString('en-us')}`
    })

    try {
        await server.listen(port)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

main()