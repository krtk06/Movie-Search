export const POSTER_PLACEHOLDER = "https://placehold.co/400x600/0a0a0a/333333?text=No+Poster";

export function getPosterUrl(poster) {
  if (!poster || poster === "N/A") return POSTER_PLACEHOLDER;
  return poster.replace(/^http:/, "https:");
}

export const searchMovies = async (query) => {
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=4e2dfea1&s=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  if (data.Response === "True") return data.Search;
  throw new Error(data.Error || "No movies found");
};

export const getMovieById = async (imdbID) => {
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=4e2dfea1&i=${imdbID}&plot=full`
  );
  return res.json();
};
