//Navbar

import React, { useEffect, useState, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../images/paradise.jpg";
import "../style/navbar.css";

function Navbar() {
  const navRef = useRef();

  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  return (
    <header>
      <img src={logo} alt="logo" />
      <nav ref={navRef}>
        <Link to="/home">Home</Link> <span style={{ marginTop: '-6px' }}>|</span>
        <a href="/events">Events</a>
        <a href="https://discord.gg/MZf6D274FE">Our Server</a>
        <Link to="about">About Us</Link>
        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button>
      </nav>
      <button className="nav-btn" onClick={showNavbar}>
        <FaBars />
      </button>
    </header>
  );
}

export default Navbar;
