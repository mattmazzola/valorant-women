import dotenv from "dotenv-flow"
import fastify from "fastify"
import fastifyCors from "fastify-cors"
import "reflect-metadata"
import invariant from 'tiny-invariant'
import ormPlugin from "./plugins/orm"
import ratings from './routes/ratings'

dotenv.config()

process.on('unhandledRejection', error => {
    throw error
})

async function main() {
    const hostname = process.env.HOSTNAME
    invariant(typeof hostname === 'string')
    
    const port = process.env.PORT
    invariant(typeof port === 'string')

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

    server.register(fastifyCors)
    server.register(ratings, { prefix: '/ratings' })

    server.get('/info/routes', async () => {
        return server.printRoutes()
    })

    server.get('/', async (request, reply) => {
        return `Women of Valorant server running... ${new Date().toLocaleDateString('en-us')}`
    })

    try {
        console.log(`http://localhost:${port}`)
        await server.listen(port, hostname)
    } catch (err) {
        const error = err as Error
        server.log.error(error.message)
        process.exit(1)
    }
}

main()