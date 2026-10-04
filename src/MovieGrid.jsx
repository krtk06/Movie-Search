import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react"; // eslint-disable-line no-unused-vars
import { searchMovies } from "./API/omdb.js";
import { translateToEnglish, getLangLabel } from "./API/translate.js";
import NavBar from "./Components/NavBar.jsx";
import RevealOnScroll from "./Components/RevealOnScroll";
import MovieCard from "./Components/MovieCard";
import { Film, Search, ArrowRight, Languages, Clock, Sparkles } from "./Components/PixelIcon";
import { useFavorites } from "./Components/FavText.jsx";

const TRENDING_QUERY = "2025";

const SUGGESTIONS = ["2025", "Action", "Drama", "Sci-Fi", "Thriller", "Animation", "Horror", "Comedy"];

const TAGLINES = [
  "Discover, explore, and relive the magic of cinema.",
  "Uncover unforgettable stories and timeless adventures.",
  "Journey through worlds created by imagination.",
  "Find your next favorite movie, one story at a time.",
];

const RECOMMENDED_QUERIES = [
  "2010", "2014", "2019", "2008", "2001", "1999", "2024", "1988", "2003", "1995",
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function SectionHead({ eyebrow, title, meta }) {
  return (
    <div className="section-head">
      <div className="section-head-main">
        <span className="eyebrow-accent">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      {meta ? <div className="section-meta">{meta}</div> : null}
    </div>
  );
}

function MovieGrid({ items, isFavorite, toggleFavorite }) {
  return (
    <motion.div className="results-grid" layout>
      <AnimatePresence mode="popLayout">
        {items.map((movie, index) => (
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
  );
}

function SkeletonGrid({ count = 8 }) {
  return (
    <div className="results-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-poster pixel-skeleton" />
          <div className="skeleton-text pixel-skeleton" />
          <div className="skeleton-text short pixel-skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function MoviesGrid() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const scrollToResultsRef = useRef(false);

  // Rotating taglines
  useEffect(() => {
    const ti = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(ti);
  }, []);

  // Initial "Now Showing" (trending) load
  useEffect(() => {
    let alive = true;
    setTrendingLoading(true);
    searchMovies(TRENDING_QUERY)
      .then((data) => alive && setTrending(data))
      .catch(() => { /* ignore */ })
      .finally(() => alive && setTrendingLoading(false));
    return () => { alive = false; };
  }, []);

  // Curated recommendations — a random pick per query so the shelf rotates
  const loadRecommended = async () => {
    const picked = [];
    const NOISY = /awards|mtv|festival|ceremony|trailer|special|behind the scenes|making of/i;
    for (const q of shuffle(RECOMMENDED_QUERIES)) {
      if (picked.length >= 5) break;
      try {
        const data = await searchMovies(q);
        const valid = data.filter(
          (m) => m.Poster && m.Poster !== "N/A" && m.Type === "movie" && !NOISY.test(m.Title)
        );
        if (!valid.length) continue;
        const choice = valid[Math.floor(Math.random() * valid.length)];
        if (!picked.some((p) => p.imdbID === choice.imdbID)) picked.push(choice);
      } catch { /* skip failed query */ }
    }
    return picked.slice(0, 5);
  };

  useEffect(() => {
    let alive = true;
    loadRecommended().then((recs) => alive && setRecommended(recs));
    return () => { alive = false; };
  }, []);

  // Refresh recommendations periodically
  useEffect(() => {
    const ri = setInterval(async () => {
      const recs = await loadRecommended();
      if (recs.length > 0) setRecommended(recs);
    }, 20000);
    return () => clearInterval(ri);
  }, []);

  const handleSearch = async (searchTerm) => {
    const term = (searchTerm ?? query).trim();
    if (!term) return;
    scrollToResultsRef.current = true;
    setLoading(true);
    setError("");
    setHasSearched(true);
    setQuery(term);
    setTranslation(null);
    setMovies([]);

    const t = await translateToEnglish(term);
    setTranslation(t);
    const finalTerm = t.wasTranslated ? t.translated : term;

    try {
      const data = await searchMovies(finalTerm);
      setMovies(data);
    } catch (err) {
      const message = err?.message || "Something went wrong";
      if (/not found/i.test(message)) setMovies([]);
      else setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  // Bring the results into view once the section first renders, clearing the
  // fixed nav so the heading is not hidden underneath it.
  useEffect(() => {
    if (!hasSearched || !scrollToResultsRef.current) return;
    scrollToResultsRef.current = false;
    const node = resultsRef.current;
    if (!node) return;
    const navHeight = document.querySelector(".nav")?.getBoundingClientRect().height ?? 0;
    const top = node.getBoundingClientRect().top + window.scrollY - navHeight - 24;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }, [hasSearched]);

  const isFavorite = (movie) => favorites.some((fav) => fav.imdbID === movie.imdbID);

  const toggleFavorite = (movie) => {
    if (isFavorite(movie)) removeFromFavorites(movie.imdbID);
    else addToFavorites(movie);
  };

  const resultsTitle = loading ? (
    <>Searching the archives for <em>“{query}”</em></>
  ) : error ? (
    <>Search failed for <em>“{query}”</em></>
  ) : movies.length === 0 ? (
    <>Search <em>Results</em> <span className="section-title-sub">for “{query}”</span></>
  ) : (
    <>Found <em>{movies.length}</em> {movies.length === 1 ? "film" : "films"}{" "}
      <span className="section-title-sub">for “{query}”</span>
    </>
  );

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
              <span className="hero-caret" aria-hidden="true" />
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
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {TAGLINES[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </RevealOnScroll>

          <RevealOnScroll y={24} delay={0.45}>
            <form
              className="hero-search"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <Search className="w-5 h-5 search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a movie, genre, or year…"
                aria-label="Search movies"
              />
              <button type="submit" className="search-submit pixel-btn">
                Search
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="hero-suggestions">
              <span className="label">Quick Search</span>
              {SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="suggestion-chip pixel-tag"
                  onClick={() => handleSuggestionClick(term)}
                >
                  {term}
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

      {hasSearched ? (
        <>
          {/* SEARCH RESULTS */}
          <section className="section" id="results" ref={resultsRef}>
            <RevealOnScroll y={24}>
              <SectionHead
                eyebrow={
                  <>
                    <Search className="w-3.5 h-3.5" /> Search Results
                  </>
                }
                title={resultsTitle}
                meta={
                  !loading && !error && movies.length > 0 ? (
                    <>
                      <span className="pip" />
                      Index · {String(movies.length).padStart(3, "0")}
                    </>
                  ) : null
                }
              />
            </RevealOnScroll>

            {translation?.wasTranslated && (
              <div className="translation-banner">
                <Languages className="w-3.5 h-3.5" />
                <span className="tb-label">Translated from {getLangLabel(translation.sourceLang)}</span>
                <span className="tb-arrow">
                  <span className="tb-original">“{translation.original}”</span>
                  <ArrowRight className="w-3 h-3 tb-arrow-icon" />
                  <span className="tb-translated">“{translation.translated}”</span>
                </span>
              </div>
            )}

            {loading && <SkeletonGrid count={8} />}

            {!loading && error && (
              <div className="error-state">
                <Film className="w-8 h-8" />
                <p>{error}</p>
                <button type="button" className="pixel-btn" onClick={() => handleSearch()}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && movies.length === 0 && (
              <div className="empty-state">
                <Search className="w-10 h-10" />
                <p>No films found for “{query}”</p>
                <p className="sub">Try a different title, genre, or year</p>
              </div>
            )}

            {!loading && !error && movies.length > 0 && (
              <MovieGrid items={movies} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            )}
          </section>

          {recommended.length > 0 && (
            <section className="section">
              <SectionHead
                eyebrow={
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Curated Picks
                  </>
                }
                title={<>Recommended <em>for You</em></>}
                meta={
                  <>
                    <Clock className="w-3.5 h-3.5" /> Updates every 20s
                  </>
                }
              />
              <MovieGrid items={recommended} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            </section>
          )}
        </>
      ) : (
        <>
          {recommended.length > 0 && (
            <section className="section">
              <SectionHead
                eyebrow={
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Curated Picks
                  </>
                }
                title={<>Recommended <em>for You</em></>}
                meta={
                  <>
                    <Clock className="w-3.5 h-3.5" /> Updates every 20s
                  </>
                }
              />
              <MovieGrid items={recommended} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            </section>
          )}

          {(trendingLoading || trending.length > 0) && (
            <section className="section">
              <SectionHead
                eyebrow={
                  <>
                    <Film className="w-3.5 h-3.5" /> Now Showing
                  </>
                }
                title={<>Trending in <em>2025</em></>}
                meta={
                  !trendingLoading && trending.length > 0 ? (
                    <>
                      <span className="pip" />
                      Fresh picks · {String(trending.length).padStart(3, "0")}
                    </>
                  ) : null
                }
              />
              {trendingLoading ? (
                <SkeletonGrid count={9} />
              ) : (
                <MovieGrid items={trending} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
              )}
            </section>
          )}
        </>
      )}

      {/* FOOTER */}
      <footer className="site-footer">
        <span className="eyebrow">
          <span className="accent">©</span> MMXXVI · CINEMART
        </span>
        <span className="site-footer-mark">End of Reel</span>
      </footer>
    </>
  );
}
