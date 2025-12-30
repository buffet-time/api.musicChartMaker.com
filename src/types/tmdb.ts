interface SharedResults {
	adult: boolean
	backdrop_path: string
	genre_ids: number[]
	id: number
	original_language: string
	overview: string
	popularity: number
	poster_path: string | null
	vote_average: number
	vote_count: number
}

interface MovieResults extends SharedResults {
	original_title: string
	release_date: string | null
	title: string
	video: boolean
}

interface TVResults extends SharedResults {
	origin_country: string[]
	original_name: string
	first_air_date: string
	name: string
}

export interface SearchMovieResponse {
	page: number
	results: MovieResults[]
	total_pages: number
	total_results: number
}

export interface SearchTVResponse {
	page: number
	results: TVResults[]
	total_pages: number
	total_results: number
}

export interface SearchMovieReturnType {
	title: string
	moviePosterUrl: string | null
}

export interface SearchTVReturnType {
	title: string
	tvPosterUrl: string | null
}
