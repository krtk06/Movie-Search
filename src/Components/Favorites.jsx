import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react"; // eslint-disable-line no-unused-vars
import { useFavorites } from "./FavText.jsx";
import NavBar from "./NavBar.jsx";
import { Heart, ArrowLeft, ArrowUpRight } from "./PixelIcon";
import RevealOnScroll from "./RevealOnScroll";
import Marquee from "./Marquee";
import MovieCard from "./MovieCard";

export default function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <NavBar />

      <section className="section section-top">
        <RevealOnScroll y={20}>
          <div className="fav-header">
            <Link to="/" className="fav-header-back" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="eyebrow-accent" style={{ marginBottom: 12 }}>
                Personal Collection
              </div>
              <h1>
                Your <em>Collection</em>
              </h1>
              <div className="count">
                <span className="pip" />
                {favorites.length} film{favorites.length !== 1 ? "s" : ""} curated
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {favorites.length === 0 ? (
          <RevealOnScroll y={20} delay={0.15}>
            <div className="empty-state">
              <Heart className="w-12 h-12" />
              <p>No save data</p>
              <p className="sub">Films you collect will appear here</p>
              <Link to="/" className="pixel-btn">
                Discover Films
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
        ) : (
          <>
            <RevealOnScroll y={16} delay={0.1}>
              <div className="collection-index">
                <span className="pip" />
                Curated Index · {String(favorites.length).padStart(3, "0")}
              </div>
            </RevealOnScroll>

            <motion.div className="results-grid" layout>
              <AnimatePresence mode="popLayout">
                {favorites.map((movie, index) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    index={index}
                    isFavorite
                    onToggleFavorite={() => removeFromFavorites(movie.imdbID)}
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
