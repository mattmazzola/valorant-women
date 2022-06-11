import fastifyCors from "@fastify/cors"
import dotenv from "dotenv-flow"
import fastify from "fastify"
import "reflect-metadata"
import invariant from 'tiny-invariant'
import ratings from './routes/ratings'

dotenv.config()

process.on('unhandledRejection', error => {
    throw error
})

const host = process.env.HOST
invariant(typeof host === 'string')

const port = Number(process.env.PORT)
invariant(typeof port === 'number')

const server = fastify({
    logger: {
        transport: {
          target: 'pino-pretty',
          options: { destination: 1 }
        }
        // redact: ['req.headers.authorization'],
        // level: ['info']
    },
    caseSensitive: false,
})

// server.register(ormPlugin)
//     .after(err => {
//         if (err) throw err
//     })

server.register(fastifyCors)
server.register(ratings, { prefix: '/ratings' })

server.get('/info/routes', async () => {
    return server.printRoutes()
})

server.get('/', async () => {
    return `Women of Valorant server running... ${new Date().toLocaleDateString('en-us')}`
})

async function start() {
    try {
        console.log(`http://localhost:${port}`)
        await server.listen({
            port,
            host,
        })
    } catch (err) {
        const error = err as Error
        server.log.error(error.message)
        process.exit(1)
    }
}

start()