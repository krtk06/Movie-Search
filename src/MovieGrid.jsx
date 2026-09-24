import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react"; // eslint-disable-line no-unused-vars
import { searchMovies, getMovieById, getPosterUrl, POSTER_PLACEHOLDER } from "./API/omdb.js";
import { translateToEnglish, getLangLabel } from "./API/translate.js";
import NavBar from "./Components/NavBar.jsx";
import RevealOnScroll from "./Components/RevealOnScroll";
import TiltCard from "./Components/TiltCard";
import { Heart, Film, Search, Star, ArrowRight, Languages, Clock, Sparkles } from "lucide-react";
import { useFavorites } from "./Components/FavText.jsx";

const SUGGESTIONS = ["2025", "Action", "Drama", "Sci-Fi", "Thriller", "Animation", "Horror", "Comedy"];

const TAGLINES = [
  "Discover, explore, and relive the magic of cinema.",
  "Uncover unforgettable stories and timeless adventures.",
  "Journey through worlds created by imagination.",
  "Find your next favorite movie, one story at a time.",
];

const RECOMMENDED_QUERIES = ["2025", "2024", "popular", "marvel", "action", "drama", "sci-fi", "comedy", "thriller", "animation", "horror", "romance"];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } },
};

function MovieCard({ movie, index, isFavorite, onToggleFavorite }) {
  const [heartBurst, setHeartBurst] = useState(false);
  const [rating, setRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!movie.imdbRating) {
      setRatingLoading(true);
      getMovieById(movie.imdbID)
        .then((data) => {
          const r = parseFloat(data.imdbRating);
          setRating(isNaN(r) ? null : r);
        })
        .catch(() => setRating(null))
        .finally(() => setRatingLoading(false));
    } else {
      const r = parseFloat(movie.imdbRating);
      setRating(isNaN(r) ? null : r);
    }
  }, [movie.imdbID]);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(movie);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 500);
  };

  const posterSrc = imgError ? POSTER_PLACEHOLDER : getPosterUrl(movie.Poster);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      layoutId={movie.imdbID}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: "block", textDecoration: "none", color: "inherit" }}
    >
      <Link
        to={`/movie/${movie.imdbID}`}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <TiltCard maxTilt={4} glare={false} className="movie-card">
          <motion.div
            className="movie-card-poster-wrap"
            animate={{ y: isHovered ? -6 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="movie-card-poster">
              <motion.img
                src={posterSrc}
                alt={movie.Title}
                loading="lazy"
                onError={() => setImgError(true)}
                animate={{
                  scale: isHovered ? 1.08 : 1,
                  filter: isHovered ? "saturate(1.1) contrast(1.1) brightness(1)" : "saturate(0.9) contrast(1.05) brightness(0.9)",
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <motion.div
              className="movie-card-overlay"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            />

            <div className="movie-card-num">
              {String(index + 1).padStart(3, "0")}
            </div>

            <motion.div
              className={`movie-card-rating ${rating !== null ? "loaded" : ""} ${ratingLoading ? "loading" : ""}`}
              animate={{ opacity: rating !== null ? 1 : 0, y: rating !== null ? 0 : -4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {ratingLoading ? "···" : rating !== null ? (
                <><Star className="w-2.5 h-2.5" style={{ fill: "currentColor" }} />{rating.toFixed(1)}</>
              ) : null}
            </motion.div>

            <motion.button
              onClick={handleHeartClick}
              className={`movie-card-fav ${isFavorite ? "favorited" : ""}`}
              aria-label="Toggle favorite"
              animate={{ opacity: isFavorite || isHovered ? 1 : 0, y: isFavorite || isHovered ? 0 : 8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-4 h-4 transition-all ${isFavorite ? "fill-current" : ""} ${heartBurst ? "heart-burst" : ""}`} />
            </motion.button>

            <motion.div
              className="movie-card-year"
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {movie.Year}
            </motion.div>
          </motion.div>

          <div className="movie-card-info">
            <motion.h3
              animate={{ color: isHovered ? "var(--accent)" : "var(--cream)" }}
              transition={{ duration: 0.3 }}
            >
              {movie.Title}
            </motion.h3>
            <span className="type">{movie.Type || "Film"}</span>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
}

export default function MoviesGrid() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [trendingLoaded, setTrendingLoaded] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [recLoaded, setRecLoaded] = useState(false);

  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const searchInputRef = useRef(null);

  // Rotating taglines
  useEffect(() => {
    const ti = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(ti);
  }, []);

  // Load initial trending
  useEffect(() => {
    if (!trendingLoaded) {
      setTrendingLoaded(true);
      setLoading(true);
      setHasSearched(true);
      searchMovies("2025")
        .then((data) => setMovies(data))
        .catch(() => {/* ignore */})
        .finally(() => setLoading(false));
    }
  }, []);

  // Load recommended movies (only those with posters)
  const loadRecommended = async () => {
    const withPosters = [];
    for (const q of RECOMMENDED_QUERIES) {
      if (withPosters.length >= 6) break;
      try {
        const data = await searchMovies(q);
        const valid = data.filter((m) => m.Poster && m.Poster !== "N/A");
        for (const v of valid) {
          if (!withPosters.some((w) => w.imdbID === v.imdbID)) {
            withPosters.push(v);
            if (withPosters.length >= 6) break;
          }
        }
      } catch { /* empty - skip failed queries */ }
    }
    return withPosters.slice(0, 6);
  };

  useEffect(() => {
    if (!recLoaded) {
      setRecLoaded(true);
      loadRecommended().then((recs) => setRecommended(recs));
    }
  }, []);

  // Rotate recommended movies every 20s
  useEffect(() => {
    const ri = setInterval(async () => {
      const newRecs = await loadRecommended();
      if (newRecs.length > 0) setRecommended(newRecs);
    }, 20000);
    return () => clearInterval(ri);
  }, []);

  const handleSearch = async (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    setLoading(true);
    setError("");
    setHasSearched(true);
    setQuery(term);
    setTranslation(null);
    const t = await translateToEnglish(term);
    setTranslation(t);
    const searchTermFinal = t.wasTranslated ? t.translated : term;
    searchMovies(searchTermFinal)
      .then((data) => setMovies(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const isFavorite = (movie) => favorites.some((fav) => fav.imdbID === movie.imdbID);

  const toggleFavorite = (movie) => {
    if (isFavorite(movie)) removeFromFavorites(movie.imdbID);
    else addToFavorites(movie);
  };

  return (
    <>
      <NavBar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
        </div>

        <div className="hero-inner">
          <RevealOnScroll y={20} delay={0.05}>
            <div className="hero-meta">
              <span className="live">
                <span className="dot" />
                Now Showing · 2026 Edition
              </span>
              <span className="divider" />
              <span className="vol">
                Your ultimate <b>cinema</b> destination
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll y={30} delay={0.15}>
            <h1 className="hero-logo">
              <span className="accent">CINE</span>MART<span className="dot">.</span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll y={20} delay={0.3}>
            <div className="hero-tagline-rotator">
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIndex}
                  className="hero-tagline-line"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {TAGLINES[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </RevealOnScroll>

          <RevealOnScroll y={24} delay={0.45}>
            <div className="hero-search">
              <Search className="w-5 h-5 search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for a movie, genre, or year..."
              />
              <button onClick={() => handleSearch()} className="search-submit">
                Search
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hero-suggestions">
              <span className="label">Quick Search</span>
              {SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(term)}
                >
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </RevealOnScroll>
        </div>

        <div className="hero-scroll">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      {/* RECOMMENDED SECTION */}
      {recommended.length > 0 && (
        <section className="section">
          <RevealOnScroll y={24}>
            <div className="section-head">
              <div>
                <span className="eyebrow-accent" style={{ marginBottom: 8, display: "block" }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  Curated Picks
                </span>
                <h2 className="section-title">
                  Recommended <em>for You</em>
                </h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-3)" }}>
                <Clock className="w-3.5 h-3.5" />
                Updates every 20s
              </div>
            </div>
          </RevealOnScroll>

          <motion.div className="recommended-grid" layout>
            <AnimatePresence mode="popLayout">
              {recommended.map((movie, index) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  index={index}
                  isFavorite={isFavorite(movie)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {/* RESULTS */}
      <section className="section" style={{ paddingTop: recommended.length > 0 ? 40 : 100 }}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="loading-row">
                <div className="spinner" />
                <span>Searching the archives…</span>
              </div>
              <div className="results-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-poster" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text short" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              className="error-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Film className="w-8 h-8" />
              <p>{error}</p>
              <button onClick={() => handleSearch()}>Try Again</button>
            </motion.div>
          )}

          {!loading && !error && hasSearched && movies.length === 0 && (
            <motion.div
              key="empty"
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Search className="w-10 h-10" />
              <p>No films found for "{query}"</p>
              <p className="sub">Try a different search term</p>
            </motion.div>
          )}

          {!loading && movies.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {translation && translation.wasTranslated && (
                <div className="translation-banner">
                  <Languages className="w-3.5 h-3.5" />
                  <span className="tb-label">Translated from {getLangLabel(translation.sourceLang)}</span>
                  <span className="tb-arrow">
                    <span className="tb-original">"{translation.original}"</span>
                    <ArrowRight className="w-3 h-3 tb-arrow-icon" />
                    <span className="tb-translated">"{translation.translated}"</span>
                  </span>
                </div>
              )}

              <RevealOnScroll y={20}>
                <div className="section-head">
                  <div>
                    <span className="eyebrow-accent" style={{ marginBottom: 8, display: "block" }}>Search Results</span>
                    <h2 className="section-title">
                      Found <em>{movies.length}</em> {movies.length === 1 ? "film" : "films"}
                      <span style={{ color: "var(--cream-3)", fontWeight: 300 }}> for "{query}"</span>
                    </h2>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-3)" }}>
                    <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />
                    Index · {String(movies.length).padStart(3, "0")}
                  </div>
                </div>
              </RevealOnScroll>

              <motion.div className="results-grid" layout>
                <AnimatePresence mode="popLayout">
                  {movies.map((movie, index) => (
                    <MovieCard
                      key={movie.imdbID}
                      movie={movie}
                      index={index}
                      isFavorite={isFavorite(movie)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "60px 40px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        background: "var(--ink-2)",
      }}>
        <span className="eyebrow" style={{ color: "var(--cream-3)" }}>
          <span style={{ color: "var(--accent)" }}>©</span> MMXXVI · CINEMART
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--cream-3)", fontSize: 18 }}>
          End of Reel
        </span>
      </footer>
    </>
  );
}
