import { ProperFetch } from '../helpers/misc'
import { ServerType } from '../types/general'

export function setupImageProxyRequests(server: ServerType) {
	server.get(
		'/TmdbImageProxy',
		{
			schema: {
				querystring: {
					type: 'object',
					properties: {
						// The search query
						url: { type: 'string' },
					},
					required: ['url'],
				},
			},
		},
		async (request, response) => {
			try {
				const tmdbUrlToProxy = request.query.url
				const tmdbUrlAsUrlObject = new URL(tmdbUrlToProxy)

				const isTmdbImageDomain = tmdbUrlAsUrlObject.hostname === 'image.tmdb.org'
				const isValidProtocol =
					tmdbUrlAsUrlObject.protocol === 'https:' || tmdbUrlAsUrlObject.protocol === 'http:'

				if (!isTmdbImageDomain || !isValidProtocol) {
					response
						.status(418)
						.send(
							`ah fuck I can't believe you've done this\n uh, how did this happen?\n only works with TMDB images.`,
						)
				}

				const proxiedImageResponse = await ProperFetch(tmdbUrlToProxy)
				const arrayBuffer = await proxiedImageResponse.arrayBuffer()
				const buffer = Buffer.from(arrayBuffer)

				response.headers({
					'Content-Type': proxiedImageResponse.headers.get('content-type') || 'image/jpeg',
					'Access-Control-Allow-Origin': '*',
				})

				response.send(buffer)
			} catch (error: any) {
				console.log(`Error in /Search/TV request:\n ${error}`)
				response
					.status(418)
					.send(`ah fuck I can't believe you've done this\n uh, how did this happen? ${error}`)
			}
		},
	)
}
