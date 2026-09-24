import React, { useEffect } from "react";
import { motion } from "motion/react"; // eslint-disable-line no-unused-vars
import NavBar from "./NavBar.jsx";
import { Clapperboard, Heart, Search, ArrowUpRight } from "./PixelIcon";
import { Link } from "react-router-dom";
import RevealOnScroll from "./RevealOnScroll";
import Marquee from "./Marquee";

const featureVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FEATURES = [
  {
    num: "01 · Explore",
    icon: <Search className="w-7 h-7 icon" />,
    title: "Discover",
    desc: "Search thousands of films through the OMDb database and see where each title is streaming via TMDB.",
  },
  {
    num: "02 · Collect",
    icon: <Heart className="w-7 h-7 icon" />,
    title: "Curate",
    desc: "Save films to a personal collection that lives in your browser — a library that tells the story of your taste.",
  },
  {
    num: "03 · Remember",
    icon: <Clapperboard className="w-7 h-7 icon" />,
    title: "Return",
    desc: "Your collection persists across sessions. Sign in, come back, and pick up where the reel left off.",
  },
];

const TECH = ["React 19", "Vite", "Tailwind v4", "Motion", "OMDb API", "TMDB API", "Firebase Auth"];

export default function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <NavBar />

      <section className="about-section">
        <RevealOnScroll y={20} delay={0.05}>
          <div className="about-eyebrow">About CINEMART · Your Cinema Companion</div>
        </RevealOnScroll>

        <RevealOnScroll y={48} delay={0.15}>
          <h1 className="about-title">
            The <em>CINEMART</em>
            <br />
            Project.
          </h1>
        </RevealOnScroll>

        <RevealOnScroll y={24} delay={0.3}>
          <p className="about-tagline">
            A curated cinema index — built for people who love films, keep lists,
            return to scenes, and never tire of discovering something new.
          </p>
        </RevealOnScroll>

        <RevealOnScroll y={32} delay={0.45}>
          <div className="about-blockquote">
            <span className="quote-mark" aria-hidden="true">“</span>
            <div>
              <blockquote>Cinema is a matter of what's in the frame and what's out.</blockquote>
              <cite>— Martin Scorsese</cite>
            </div>
          </div>
        </RevealOnScroll>

        <div className="about-grid">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.num}
              custom={i}
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <div className="about-grid-item">
                <span className="num">{feature.num}</span>
                {feature.icon}
                <h3>
                  <em>{feature.title}</em>
                </h3>
                <p>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <RevealOnScroll y={24} delay={0.4}>
          <div className="about-tech">
            <div className="label">Built With</div>
            <div className="about-tech-tags">
              {TECH.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll y={20} delay={0.5}>
          <Link to="/" className="pixel-btn">
            <span>Start Exploring</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </RevealOnScroll>
      </section>

      <Marquee
        speed={50}
        items={[
          { num: "I.", text: "Discover" },
          { num: "II.", text: "Curate" },
          { num: "III.", text: "Remember" },
          { num: "IV.", text: "CINEMART" },
        ]}
      />
    </>
  );
}
