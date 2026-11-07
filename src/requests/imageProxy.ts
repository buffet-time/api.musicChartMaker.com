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
			response.header('access-control-allow-origin', '*')

			try {
				const tmdbUrlToProxy = request.query.url
				const tmdbUrlAsUrlObject = new URL(tmdbUrlToProxy)

				const isTmdbImageDomain = tmdbUrlAsUrlObject.hostname === 'image.tmdb.org'
				const isValidProtocol =
					tmdbUrlAsUrlObject.protocol === 'https:' || tmdbUrlAsUrlObject.protocol === 'http:'

				if (!isTmdbImageDomain || !isValidProtocol) {
					throw new Error('Not from TMDB image domain')
				}

				const proxiedImageResponse = await fetch(tmdbUrlToProxy)

				if (!proxiedImageResponse.ok) {
					throw new Error('Error fetching from TMDB')
				}

				const arrayBuffer = await proxiedImageResponse.arrayBuffer()
				const buffer = Buffer.from(arrayBuffer)

				response.header(
					'content-type',
					proxiedImageResponse.headers.get('content-type') || 'image/jpeg',
				)

				return response.send(buffer)
			} catch (error: any) {
				console.log(`Error in /TmdbImageProxy:\n ${error}`)
				response
					.status(418)
					.send(`ah fuck I can't believe you've done this\n uh, how did this happen? ${error}`)
			}
		},
	)
}
