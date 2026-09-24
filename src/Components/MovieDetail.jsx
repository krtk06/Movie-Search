import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react"; // eslint-disable-line no-unused-vars
import { getMovieById, getPosterUrl, POSTER_PLACEHOLDER } from "../API/omdb.js";
import { ArrowLeft, Star, Clock, Calendar, User, Award, Film } from "./PixelIcon";
import {
  getStreamingProviders,
  ALL_PLATFORM_KEYS,
  PLATFORM_NAMES,
  PLATFORM_URLS,
} from "../API/tmdb.jsx";
import NavBar from "./NavBar.jsx";
import RevealOnScroll from "./RevealOnScroll";
import TiltCard from "./TiltCard";
import Marquee from "./Marquee";
import PlatformIcon from "./PlatformIcon";

const ratingIcons = {
  "Internet Movie Database": { icon: "IMDb", color: "#f5c518" },
  "Rotten Tomatoes": { icon: "RT", color: "#fa320a" },
  Metacritic: { icon: "MC", color: "#19c37d" },
};

export default function MovieDetail() {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [streamingResult, setStreamingResult] = useState(null);
  const [streamingLoading, setStreamingLoading] = useState(true);

  const { scrollY } = useScroll();
  const posterY = useTransform(scrollY, [0, 800], [0, -120]);
  const posterScale = useTransform(scrollY, [0, 800], [1, 1.06]);
  const posterRotate = useTransform(scrollY, [0, 800], [0, -3]);
  const infoX = useTransform(scrollY, [0, 600], [0, 30]);
  const infoOpacity = useTransform(scrollY, [0, 600], [1, 0.6]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  useEffect(() => {
    if (!imdbID) return;
    setLoading(true);
    getMovieById(imdbID)
      .then((data) => {
        if (data.Response === "False") throw new Error(data.Error);
        setMovie(data);
      })
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [imdbID]);

  useEffect(() => {
    setStreamingLoading(true);
    getStreamingProviders(imdbID).then((result) => {
      setStreamingResult(result);
      setStreamingLoading(false);
    });
  }, [imdbID]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [imdbID]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="detail-page">
          <div className="loading-row" style={{ marginTop: 80 }}>
            <div className="spinner" />
            <span>Loading film data…</span>
          </div>
        </div>
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <NavBar />
        <div className="detail-page">
          <div className="empty-state">
            <Film className="w-12 h-12" />
            <p>Film not found</p>
            <p className="sub">The film you're looking for has slipped the reel</p>
            <Link to="/" className="btn-discover">
              <span>Back to Search</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  const posterSrc = imgError ? POSTER_PLACEHOLDER : getPosterUrl(movie.Poster);
  const ratings = movie.Ratings || [];
  const genreList = (movie.Genre || "N/A").split(", ");

  let visiblePlatforms;
  let streamingError = null;
  const noKeyConfigured = streamingResult && streamingResult.providers === null;
  if (streamingResult && streamingResult.providers === null) {
    visiblePlatforms = ALL_PLATFORM_KEYS.map((key) => ({
      key,
      name: PLATFORM_NAMES[key],
      logoUrl: null,
      url: PLATFORM_URLS[key](movie.Title),
    }));
  } else if (streamingResult) {
    visiblePlatforms = streamingResult.providers;
    streamingError = streamingResult.error;
  } else {
    visiblePlatforms = [];
  }

  return (
    <>
      <NavBar />

      <motion.section className="detail-page" style={{ opacity: heroOpacity }}>
        <Link to="/" className="detail-back-btn">
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="detail-hero">
          <motion.div
            style={{
              y: posterY,
              scale: posterScale,
              rotateZ: posterRotate,
            }}
          >
            <TiltCard maxTilt={3} glare={false} className="detail-poster">
              <img
                src={posterSrc}
                alt={movie.Title}
                onError={() => setImgError(true)}
              />
            </TiltCard>
          </motion.div>

          <motion.div className="detail-info" style={{ x: infoX, opacity: infoOpacity }}>
            <RevealOnScroll y={20} delay={0.05}>
              <div className="detail-eyebrow">
                <span className="num">No. {imdbID}</span>
                <span className="dot" />
                <span className="vol">Feature Film · Digital</span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll y={40} delay={0.15}>
              <h1 className="detail-title">
                {movie.Title}
                <span className="accent">.</span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll y={20} delay={0.3}>
              <div className="detail-meta">
                {movie.Year && movie.Year !== "N/A" && (
                  <span className="detail-meta-item">
                    <Calendar className="w-3 h-3" />
                    {movie.Year}
                  </span>
                )}
                {movie.Runtime && movie.Runtime !== "N/A" && (
                  <>
                    <span className="detail-meta-divider" />
                    <span className="detail-meta-item">
                      <Clock className="w-3 h-3" />
                      {movie.Runtime}
                    </span>
                  </>
                )}
                {movie.Rated && movie.Rated !== "N/A" && (
                  <>
                    <span className="detail-meta-divider" />
                    <span className="detail-meta-item rated">{movie.Rated}</span>
                  </>
                )}
              </div>
            </RevealOnScroll>

            {genreList[0] !== "N/A" && (
              <RevealOnScroll y={20} delay={0.4}>
                <div className="detail-genres">
                  {genreList.map((genre) => (
                    <span key={genre} className="detail-genre-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              </RevealOnScroll>
            )}

            {ratings.length > 0 && (
              <RevealOnScroll y={20} delay={0.5}>
                <div className="detail-ratings">
                  {ratings.map((r) => {
                    const info = ratingIcons[r.Source] || { icon: r.Source, color: "#888" };
                    return (
                      <div key={r.Source} className="detail-rating-box">
                        <span className="detail-rating-source" style={{ color: info.color }}>
                          {info.icon}
                        </span>
                        <span className="detail-rating-value">{r.Value}</span>
                      </div>
                    );
                  })}
                </div>
              </RevealOnScroll>
            )}

            {movie.Plot && movie.Plot !== "N/A" && (
              <RevealOnScroll y={20} delay={0.6}>
                <div>
                  <div className="detail-plot-label">Synopsis</div>
                  <p className="detail-plot">{movie.Plot}</p>
                </div>
              </RevealOnScroll>
            )}

            <RevealOnScroll y={20} delay={0.7}>
              <div className="detail-credits">
                {movie.Director && movie.Director !== "N/A" && (
                  <div className="detail-credit-item">
                    <User className="w-3.5 h-3.5 icon" />
                    <div>
                      <span className="detail-credit-label">Director</span>
                      <span className="detail-credit-value">{movie.Director}</span>
                    </div>
                  </div>
                )}
                {movie.Writer && movie.Writer !== "N/A" && (
                  <div className="detail-credit-item">
                    <User className="w-3.5 h-3.5 icon" />
                    <div>
                      <span className="detail-credit-label">Writer</span>
                      <span className="detail-credit-value">{movie.Writer}</span>
                    </div>
                  </div>
                )}
                {movie.Actors && movie.Actors !== "N/A" && (
                  <div className="detail-credit-item full">
                    <User className="w-3.5 h-3.5 icon" />
                    <div>
                      <span className="detail-credit-label">Cast</span>
                      <span className="detail-credit-value">{movie.Actors}</span>
                    </div>
                  </div>
                )}
              </div>
            </RevealOnScroll>

            {(movie.Awards || movie.BoxOffice) && (
              <RevealOnScroll y={20} delay={0.8}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 48, paddingTop: 32, borderTop: "1px solid var(--border-2)" }}>
                  {movie.Awards && movie.Awards !== "N/A" && (
                    <div className="detail-credit-item">
                      <Award className="w-4 h-4 icon" />
                      <div>
                        <span className="detail-credit-label">Awards</span>
                        <span className="detail-credit-value" style={{ fontSize: 15 }}>{movie.Awards}</span>
                      </div>
                    </div>
                  )}
                  {movie.BoxOffice && movie.BoxOffice !== "N/A" && (
                    <div className="detail-credit-item">
                      <Star className="w-4 h-4 icon" />
                      <div>
                        <span className="detail-credit-label">Box Office</span>
                        <span className="detail-credit-value" style={{ fontSize: 15 }}>{movie.BoxOffice}</span>
                      </div>
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            )}

            <RevealOnScroll y={20} delay={0.9}>
              <div>
                <div className="detail-plot-label">Where to Watch</div>
                {streamingLoading ? (
                  <div className="detail-streaming-loading">
                    <div className="spinner" />
                    <span>Checking availability…</span>
                  </div>
                ) : streamingError && visiblePlatforms.length === 0 && !noKeyConfigured ? (
                  <p className="detail-streaming-none error">Streaming data unavailable</p>
                ) : visiblePlatforms.length > 0 ? (
                  <div className="detail-platforms">
                    {visiblePlatforms.map((p) => (
                      <a
                        key={p.key}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platform-tile"
                        title={`Watch on ${p.name}`}
                      >
                        <span className="icon-wrap">
                          <PlatformIcon platform={p.key} size={26} />
                        </span>
                        <span className="name">{p.name}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="detail-streaming-none">Not available on major streaming services</p>
                )}
              </div>
            </RevealOnScroll>

            {((movie.Country && movie.Country !== "N/A") ||
              (movie.Language && movie.Language !== "N/A")) && (
              <RevealOnScroll y={20} delay={1.0}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border-2)" }}>
                  {movie.Country && movie.Country !== "N/A" && (
                    <div>
                      <span className="detail-credit-label">Country</span>
                      <span className="detail-credit-value" style={{ fontSize: 15 }}>{movie.Country}</span>
                    </div>
                  )}
                  {movie.Language && movie.Language !== "N/A" && (
                    <div>
                      <span className="detail-credit-label">Language</span>
                      <span className="detail-credit-value" style={{ fontSize: 15 }}>{movie.Language}</span>
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            )}
          </motion.div>
        </div>

        <Marquee
          speed={50}
          items={[
            { num: "01", text: movie.Title },
            { num: "02", text: movie.Year },
            { num: "03", text: genreList[0] || "Cinema" },
            { num: "04", text: "Now In Focus" },
          ]}
        />
      </motion.section>
    </>
  );
}
