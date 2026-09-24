const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const BASE = "https://api.tmdb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/original";

// Platform search URLs for direct click-through
export const PLATFORM_URLS = {
  netflix:   (q) => `https://www.netflix.com/search?q=${encodeURIComponent(q)}`,
  prime:     (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=instant-video`,
  disney:    (q) => `https://www.disneyplus.com/search?q=${encodeURIComponent(q)}`,
  hulu:      (q) => `https://www.hulu.com/search?q=${encodeURIComponent(q)}`,
  apple:     (q) => `https://tv.apple.com/search?term=${encodeURIComponent(q)}`,
  max:       (q) => `https://www.max.com/search?q=${encodeURIComponent(q)}`,
  paramount: (q) => `https://www.paramountplus.com/search/?q=${encodeURIComponent(q)}`,
  peacock:   (q) => `https://www.peacocktv.com/search?q=${encodeURIComponent(q)}`,
};

// Known provider IDs → platform key mapping
const PROVIDER_MAP = {
  8: "netflix",
  9: "prime",
  337: "disney",
  15: "hulu",
  2: "apple",
  384: "hbo",
  1899: "max",
  531: "paramount",
  386: "peacock",
};

// All platforms we track (used as fallback when no API data)
export const ALL_PLATFORM_KEYS = [
  "netflix", "prime", "disney", "hulu",
  "apple", "max", "paramount", "peacock",
];

export const PLATFORM_NAMES = {
  netflix: "Netflix",
  prime: "Prime Video",
  disney: "Disney+",
  hulu: "Hulu",
  apple: "Apple TV+",
  max: "Max",
  paramount: "Paramount+",
  peacock: "Peacock",
};

/**
 * Fetch streaming providers for a movie by IMDb ID.
 * Returns: { providers: array|null, error: string|null }
 * Each provider: { key, name, logoUrl, url }
 * providers=null means no API key
 * providers=[] means no data
 */
export async function getStreamingProviders(imdbID) {
  if (!TMDB_KEY) {
    return { providers: null, error: null };
  }

  try {
    const findRes = await fetch(
      `${BASE}/find/${imdbID}?external_source=imdb_id&api_key=${TMDB_KEY}`
    );
    if (!findRes.ok) {
      return { providers: [], error: `TMDB error: ${findRes.status}` };
    }
    const findData = await findRes.json();
    const movie = findData?.movie_results?.[0];
    if (!movie?.id) {
      return { providers: [], error: null };
    }

    const watchRes = await fetch(
      `${BASE}/movie/${movie.id}/watch/providers?api_key=${TMDB_KEY}`
    );
    if (!watchRes.ok) {
      return { providers: [], error: `TMDB error: ${watchRes.status}` };
    }
    const watchData = await watchRes.json();
    const usProviders = watchData?.results?.US;

    if (!usProviders) {
      return { providers: [], error: null };
    }

    // Collect unique providers with their metadata
    const seen = new Map();

    const addProviders = (list) => {
      if (!list) return;
      for (const p of list) {
        const key = PROVIDER_MAP[p.provider_id];
        if (key && !seen.has(key)) {
          seen.set(key, {
            key,
            name: p.provider_name,
            logoUrl: p.logo_path ? `${IMG_BASE}${p.logo_path}` : null,
            url: PLATFORM_URLS[key]?.(findData.movie_results?.[0]?.title || "") || "",
          });
        }
      }
    };

    // flatrate (subscription) first — most important
    addProviders(usProviders.flatrate);
    addProviders(usProviders.rent);
    addProviders(usProviders.buy);

    return { providers: [...seen.values()], error: null };
  } catch (err) {
    return { providers: [], error: err.message || "Network error" };
  }
}
