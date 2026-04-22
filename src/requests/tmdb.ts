import type { ServerType } from '../types/general'
import type {
	SearchMovieResponse,
	SearchMovieReturnType,
	SearchTVResponse,
	SearchTVReturnType
} from '../types/tmdb'
import TMDBCreds from '../credentials/tmdb.json'
import { ProperFetch } from '../helpers/misc'

const BASE_TMDB_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w300'

const TMDB_OPTIONS = {
	method: 'GET',
	headers: {
		accept: 'application/json',
		Authorization: `Bearer ${TMDBCreds.apiReadAccessToken}`
	}
}

export function setUpTmdbRequests(server: ServerType) {
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

				url += includeAdult ? '&include_adult=true' : '&include_adult=false'

				if (searchYear) {
					url += `&year=${searchYear}`
				}

				const responseFromTmdbApi: SearchMovieResponse = await ProperFetch(
					url,
					TMDB_OPTIONS
				)

				const mappedResponse: SearchMovieReturnType[] =
					responseFromTmdbApi.results.map((currentMovie) => {
						return {
							moviePosterUrl: `${IMAGE_BASE_URL}${currentMovie.poster_path}`,
							title: currentMovie.title,
							year: currentMovie.release_date
								? Number(currentMovie.release_date?.split('-')[0])
								: null
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

	server.get(
		'/Search/TV',
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

				let url = `${BASE_TMDB_URL}/search/tv?query=${searchQuery}`

				url += includeAdult ? '&include_adult=true' : '&include_adult=false'

				if (searchYear) {
					url += `&year=${searchYear}`
				}

				console.log('TV', url)
				const responseFromTmdbApi: SearchTVResponse = await ProperFetch(
					url,
					TMDB_OPTIONS
				)

				const mappedResponse: SearchTVReturnType[] =
					responseFromTmdbApi.results.map((currentTVShow) => {
						return {
							tvPosterUrl: `${IMAGE_BASE_URL}${currentTVShow.poster_path}`,
							title: currentTVShow.name,
							year: currentTVShow.first_air_date
								? Number(currentTVShow.first_air_date?.split('-')[0])
								: null
						}
					})

				response.send(mappedResponse)
			} catch (error: any) {
				console.log(`Error in /Search/TV request:\n ${error}`)
				response
					.status(418)
					.send(
						`ah fuck I can't believe you've done this\n uh, how did this happen? ${error}`
					)
			}
		}
	)
}

export function checkTmdbCreds() {
	if (
		TMDBCreds.apiReadAccessToken.length === 244 &&
		TMDBCreds.apiKey.length === 32
	) {
		return
	}

	throw new Error('TMDBCreds file not present or incorrect.')
}
