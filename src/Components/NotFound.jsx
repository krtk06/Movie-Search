import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import { Film } from "./PixelIcon";

export default function NotFound() {
  const location = useLocation();

  return (
    <>
      <NavBar />

      <section className="notfound">
        <div className="notfound-panel">
          <span className="notfound-code" aria-hidden="true">4 0 4</span>
          <h1>GAME OVER</h1>
          <p className="notfound-sub">
            <Film className="w-3.5 h-3.5" /> Reel Not Found
          </p>
          <p className="notfound-path">/error at {location.pathname}</p>
          <p className="notfound-desc">
            This scene never made the final cut. The page you're looking for was
            cut, mislabeled, or left on the cutting-room floor.
          </p>
          <div className="notfound-actions">
            <Link to="/" className="pixel-btn">
              Back to the Index
            </Link>
            <Link to="/favorites" className="pixel-btn pixel-btn--ghost">
              View Collection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
