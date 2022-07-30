import fastifyCors from "@fastify/cors"
import dotenv from "dotenv-flow"
import fastify from "fastify"
import invariant from 'tiny-invariant'
import daprPlugin from './plugins/dapr'
import ratings from './routes/ratings'
import { delay } from "./utils"

const isProduction = process.env.NODE_ENV === 'production'
console.log({ isProduction })
if (!isProduction) {
    dotenv.config()
}

const host = process.env.HOST
invariant(typeof host === 'string', `Environment variable HOST must be defined.`)

const port = Number(process.env.PORT)
invariant(typeof port === 'number', `Environment variable PORT must be defined.`)

const startDelay = Number(process.env.START_DELAY)
invariant(typeof startDelay === 'number', `Environment variable startDelay must be defined.`)

const server = fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                destination: 1
            }
        }
        // redact: ['req.headers.authorization'],
    },
    caseSensitive: false,
})

server.register(daprPlugin)
    .after(err => {
        if (err) throw err
    })

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
        console.log(`API server started.`)
        console.log(`Waiting ${startDelay} MS until SQL server finished starting...`)
        const startTimeMs = Date.now()
        const msPerSecond = 1000

        const intervalId = setInterval(() => {
            const currentTimeMs = Date.now()
            const difference = currentTimeMs - startTimeMs

            console.log(`Server waiting... ${difference / msPerSecond} seconds elapsed since start`)
        }, 1 * msPerSecond)

        await delay(startDelay)
        clearInterval(intervalId)

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