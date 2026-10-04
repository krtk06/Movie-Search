import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react"; // eslint-disable-line no-unused-vars
import Home from "./Home";
import Favorites from "./Components/Favorites";
import About from "./Components/About";
import Login from "./Components/Login";
import MovieDetail from "./Components/MovieDetail";
import ProtectedRoute from "./Components/ProtectedRoute";
import ScrollProgress from "./Components/ScrollProgress";
import NotFound from "./Components/NotFound";

export default function App() {
  const location = useLocation();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <div className="fx-scanlines" />

      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          tabIndex={-1}
          key={location.pathname}
          className="page-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/movie/:imdbID" element={<MovieDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </>
  );
}
