import { useNavigate } from "react-router-dom";
import Navbar from "./NavbarArtisan";
import logo from "../images/homepage.jpg";
import React, { useState } from "react";

// Baybayin for: si, ni, li, khai, n
const baybayin = [
  "ᜐᜒ", // si
  "ᜈᜒ", // ni
  "ᜎᜒ", // li
  "ᜃᜑᜒ", // khai
  "ᜈ᜔", // n
];
const latin = ["Si", "ni", "Li", "khai", "n"];

function SiniLikhainBaybayin() {
  const [hovered, setHovered] = useState(Array(latin.length).fill(false));

  const handleMouseEnter = (idx) => {
    setHovered((h) => h.map((v, i) => (i === idx ? true : v)));
  };
  const handleMouseLeave = (idx) => {
    setHovered((h) => h.map((v, i) => (i === idx ? false : v)));
  };

  return (
    <h2
      className="mb-2 text-4xl md:text-6xl font-extrabold tracking-widest text-white flex justify-center gap-4 select-none"
      style={{ letterSpacing: "0.05em" }}
    >
      {latin.map((char, idx) => (
        <span
          key={idx}
          className="transition-all duration-300 ease-in-out cursor-pointer relative"
          onMouseEnter={() => handleMouseEnter(idx)}
          onMouseLeave={() => handleMouseLeave(idx)}
          style={{
            display: "inline-block",
            minWidth: "2.5ch",
            position: "relative",
            textAlign: "center",
          }}
        >
          <span
            className={`block transition-all duration-300 ${
              hovered[idx] ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
            style={{ position: "absolute", left: 0, right: 0 }}
          >
            {char}
          </span>
          <span
            className={`block transition-all duration-300 ${
              hovered[idx] ? "opacity-100 scale-100" : "opacity-0 scale-125"
            }`}
            style={{ position: "relative" }}
          >
            {baybayin[idx]}
          </span>
        </span>
      ))}
    </h2>
  );
}

function Artisan() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col bg-black">
      <Navbar />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={logo}
          alt="SiniLikhain artisan background"
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-4 py-20">
        <SiniLikhainBaybayin />
        <span className="text-white text-base md:text-lg tracking-widest mb-4 font-[source-code-pro,monospace] opacity-90">
          Welcome, Artisan!
        </span>
        <h1 className="text-2xl md:text-4xl font-bold font-[source-code-pro,monospace] text-white mb-8 leading-tight tracking-wide">
          In simplicity, the seed of creation;
          <br />
          in humble tools, the birth of brilliance.
        </h1>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/aboutartisan"
            className="inline-block px-8 py-3 border border-white text-white font-[source-code-pro,monospace] text-base tracking-widest rounded bg-transparent hover:bg-white hover:text-black hover:!bg-black hover:!text-white transition-colors duration-200 group"
            style={{ transition: "color 0.2s, background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            VIEW MORE
          </a>
          <a
            href="/artisanprofile"
            className="inline-block px-8 py-3 border border-white text-white font-[source-code-pro,monospace] text-base tracking-widest rounded bg-white text-black hover:opacity-90 transition-opacity duration-200"
          >
            MY INVENTORY
          </a>
        </div>
      </main>
    </div>
  );
}

export default Artisan;
