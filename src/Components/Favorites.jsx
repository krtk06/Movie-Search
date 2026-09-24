import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react"; // eslint-disable-line no-unused-vars
import { useFavorites } from "./FavText.jsx";
import NavBar from "./NavBar.jsx";
import { Heart, Film, ArrowLeft, Star, ArrowUpRight } from "./PixelIcon";
import { getMovieById, getPosterUrl, POSTER_PLACEHOLDER } from "../API/omdb.js";
import RevealOnScroll from "./RevealOnScroll";
import TiltCard from "./TiltCard";
import Marquee from "./Marquee";

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

function FavCard({ movie, index, onRemove }) {
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

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(movie.imdbID);
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
              onClick={handleRemove}
              className="movie-card-fav favorited"
              aria-label="Remove from collection"
              animate={{ opacity: isHovered ? 1 : 0.7, y: isHovered ? 0 : 2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-4 h-4 fill-current ${heartBurst ? "heart-burst" : ""}`} />
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

export default function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <NavBar />

      <section className="section" style={{ paddingTop: 140 }}>
        <RevealOnScroll y={20}>
          <div className="fav-header">
            <Link to="/" className="fav-header-back">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="eyebrow-accent" style={{ marginBottom: 8 }}>
                <span style={{ display: "inline-block", width: 24, height: 2, background: "var(--accent)", marginRight: 12, borderRadius: 1, verticalAlign: "middle" }} />
                Personal Collection
              </div>
              <h1>
                Your <em>Collection</em>
              </h1>
              <div className="count">
                <span className="pip" />
                {favorites.length} FILM{favorites.length !== 1 ? "S" : ""} CURATED
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {favorites.length === 0 ? (
          <RevealOnScroll y={20} delay={0.2}>
            <div className="empty-state">
              <Film className="w-12 h-12" />
              <p>No favorites yet</p>
              <p className="sub">Start exploring and save films you love</p>
              <Link to="/" className="btn-discover">
                <span>Discover Films</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
        ) : (
          <>
            <RevealOnScroll y={16} delay={0.15}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-3)", marginBottom: 40 }}>
                <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />
                Curated Index · {String(favorites.length).padStart(3, "0")}
              </div>
            </RevealOnScroll>
            <motion.div className="results-grid" layout>
              <AnimatePresence mode="popLayout">
                {favorites.map((movie, index) => (
                  <FavCard
                    key={movie.imdbID}
                    movie={movie}
                    index={index}
                    onRemove={removeFromFavorites}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </section>

      {favorites.length > 0 && (
        <Marquee
          speed={45}
          items={[
            { num: "01", text: "Your Selection" },
            { num: "02", text: "Curated with Care" },
            { num: "03", text: "A Library in Progress" },
            { num: "04", text: "Films that Moved You" },
          ]}
        />
      )}
    </>
  );
}
