interface MovieResults {
	adult: boolean
	backdrop_path: string
	genre_ids: number[]
	id: number
	original_language: string
	original_title: string
	overview: string
	popularity: number
	poster_path: string | null
	release_date: string | null
	title: string
	video: boolean
	vote_average: number
	vote_count: number
}

export interface SearchMovieResponse {
	page: number
	results: MovieResults[]
	total_pages: number
	total_results: number
}

export interface SearchMovieReturnType {
	title: string
	moviePosterUrl: string | null
}
