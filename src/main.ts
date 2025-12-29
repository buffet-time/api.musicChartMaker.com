import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'
import { getCurrentDate, ProperFetch } from './helpers/misc'
import TMDBCreds from './credentials/tmdb.json'
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import type { SearchMovieResponse, SearchMovieReturnType } from './types/tmdb'

// Deltron
export const PORT = 3030

const server = Fastify().withTypeProvider<JsonSchemaToTsProvider>()
await server.register(fastifyCors, {
	origin: true,
	methods: 'GET',
	allowedHeaders: 'Content-Type, Authorization'
})

const BASE_TMDB_URL = 'https://api.themoviedb.org/3'

// If we get back a 429 we somehow are being pounded :/
// Example request:
// https://api.musicChartMaker.com/Search/Movie?term=2001%20a%20space%20odyssey&adult=false&year=1968
server.get(
	'/Search/Movie',
	{
		schema: {
			querystring: {
				type: 'object',
				properties: {
					// The search query
					term: { type: 'string' },
					// whether or not to return results noted as adult, defaults to false
					adult: { type: 'boolean' },
					// year of the release to further narrow down the search, no default
					year: { type: 'number' }
				},
				required: ['term']
			}
		}
	},
	async (request, response) => {
		try {
			const searchQuery = request.query.term
			const includeAdult = request.query.adult ?? false
			const searchYear = request.query.year ?? undefined

			let url = `${BASE_TMDB_URL}/search/movie?query=${searchQuery}`

			if (includeAdult) {
				url += `&include_adult=${includeAdult}`
			}

			if (searchYear) {
				url += `&searchYear=${searchYear}`
			}

			const options = {
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${TMDBCreds.apiReadAccessToken}`
				}
			}

			const responseFromTmdbApi: SearchMovieResponse = await ProperFetch(
				url,
				options
			)

			const mappedResponse: SearchMovieReturnType[] =
				responseFromTmdbApi.results.map((currentMovie) => {
					return {
						moviePosterUrl: currentMovie.poster_path,
						title: currentMovie.title
					}
				})

			response.send(mappedResponse)
		} catch (error: any) {
			console.log(`Error in /Search/Movie request:\n ${error}`)
			response
				.status(418)
				.send(
					`ah fuck I can't believe you've done this\n uh, how did this happen? ${error}`
				)
		}
	}
)

server
	.listen({ port: PORT })
	.then(async () => {
		await onStart()
		console.log(
			`Fastify server listening on port: ${PORT} ~ ${getCurrentDate()}`
		)
	})
	.catch((error: any) => {
		console.log(
			`Failed to start Fastify server on port ${PORT}: Error - ${error} ~ ${getCurrentDate()}`
		)
	})

async function onStart() {
	try {
		// do stuff here that we wait on
	} catch (error: any) {
		throw console.log(`Error in onStart(): ${error} ~ ${getCurrentDate()}`)
	}
}
