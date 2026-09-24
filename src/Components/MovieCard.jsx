import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react"; // eslint-disable-line no-unused-vars
import { getMovieById, getPosterUrl, POSTER_PLACEHOLDER } from "../API/omdb.js";
import TiltCard from "./TiltCard";
import { Heart, Star } from "./PixelIcon";

export const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

export default function MovieCard({ movie, index = 0, isFavorite = false, onToggleFavorite }) {
  const [heartBurst, setHeartBurst] = useState(false);
  const [rating, setRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!movie.imdbRating) {
      setRatingLoading(true);
      getMovieById(movie.imdbID)
        .then((data) => {
          if (!alive) return;
          const r = parseFloat(data.imdbRating);
          setRating(isNaN(r) ? null : r);
        })
        .catch(() => alive && setRating(null))
        .finally(() => alive && setRatingLoading(false));
    } else {
      const r = parseFloat(movie.imdbRating);
      setRating(isNaN(r) ? null : r);
    }
    return () => { alive = false; };
  }, [movie.imdbID, movie.imdbRating]);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(movie);
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
      className="movie-card-wrap"
    >
      <Link to={`/movie/${movie.imdbID}`} className="movie-card-link">
        <TiltCard maxTilt={3} glare={false} className="movie-card">
          <div className="movie-card-poster-wrap">
            <div className="movie-card-poster">
              <img
                src={posterSrc}
                alt={movie.Title}
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </div>
            <div className="movie-card-overlay" />

            <span className="movie-card-num">{String(index + 1).padStart(3, "0")}</span>

            {(rating !== null || ratingLoading) && (
              <span className="movie-card-rating">
                {ratingLoading ? "···" : <><Star className="w-2.5 h-2.5" />{rating.toFixed(1)}</>}
              </span>
            )}

            <span className="movie-card-year">{movie.Year}</span>

            <button
              type="button"
              onClick={handleHeartClick}
              className={`movie-card-fav ${isFavorite ? "favorited" : ""} ${heartBurst ? "heart-burst" : ""}`}
              aria-label={isFavorite ? `Remove ${movie.Title} from collection` : `Add ${movie.Title} to collection`}
              aria-pressed={isFavorite}
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>

          <div className="movie-card-info">
            <h3>{movie.Title}</h3>
            <span className="type">{movie.Type || "film"}</span>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
}
