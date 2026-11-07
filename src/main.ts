import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'
import { getCurrentDate } from './helpers/misc'
import RateLimit from '@fastify/rate-limit'
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

import type { ServerType } from './types/general'
import { checkTmdbCreds, setUpTmdbRequests } from './requests/tmdb'
import { setupImageProxyRequests } from './requests/imageProxy'

// Deltron
const PORT = 3030

const server: ServerType = Fastify().withTypeProvider<JsonSchemaToTsProvider>()
await server.register(fastifyCors, {
	origin: '*',
	methods: ['GET', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
	preflightContinue: false,
})

await server.register(RateLimit, {
	max: 50,
	timeWindow: '1 minute',
})

setUpTmdbRequests(server)
setupImageProxyRequests(server)

server
	.listen({ port: PORT })
	.then(() => {
		onStart()
		console.log(`Fastify server listening on port: ${PORT} ~ ${getCurrentDate()}`)
	})
	.catch((error: any) => {
		console.log(
			`Failed to start Fastify server on port ${PORT}: Error - ${error} ~ ${getCurrentDate()}`,
		)
	})

function onStart() {
	try {
		checkTmdbCreds()
	} catch (error: any) {
		console.log(`Error in onStart(): ${error} ~ ${getCurrentDate()}`)
		process.exit()
	}
}
